(function () {
    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length-1].src;
    //console.log(currentScriptPath);

    angular.module('ac.noticias', ['ngRoute'])
        .directive('acNoticias', AcNoticias)
        .service('NoticiasService', NoticiasService)
        .service('NoticiasServiceUtils', NoticiasServiceUtils)
        .directive('dbinfOnFilesSelectedNoticias', dbinfOnFilesSelectedNoticias);


    AcNoticias.$inject = ['$location', '$route'];

    function AcNoticias($location, $route) {
        return {
            restrict: 'E',
            scope: {
                parametro: '='
            },
            templateUrl: currentScriptPath.replace('.js', '.html'),
            controller: NoticiasController,

            controllerAs: 'noticiasCtrl'
        };
    }



    NoticiasController.$inject = ["$http", "$scope", "$routeParams", "NoticiasService", "$location", "toastr", 'NoticiasServiceUtils'];
    function NoticiasController($http, $scope, $routeParams, NoticiasService, $location, toastr, NoticiasServiceUtils) {
        var vm = this;
        vm.isUpdate = false;
        vm.status = 1;
        vm.destacado = 0;
        vm.fotos = [];
        vm.noticia_kit = {};
        vm.noticias_kit = [];
        vm.noticias_en_kit = [];
        vm.noticia_kit_busqueda = '';
        $scope.agregarImagen = agregarImagen;
        vm.save = save;
        vm.deleteImage = deleteImage;
        vm.delete = deleteNoticia;
        vm.comentarios = comentarios;
        vm.listProveedores = [];
        vm.id = $routeParams.id;

        vm.noticia = {
            noticia_id: 0,
            titulo: '',
            detalles: '',
            fecha: '',
            creador_id: 0,
            vistas: 0,
            tipo: 0,
            fotos: [],
            comentarios: []
        };

        //vm.proveedores = [
        //    {proveedor_id: '1', nombre: 'prov01'},
        //    {proveedor_id: '2', nombre: 'prov02'},
        //    {proveedor_id: '3', nombre: 'prov03'},
        //    {proveedor_id: '4', nombre: 'prov04'}
        //];
        vm.proveedores = [];

        var foto = {nombre: '', destacado: ''};
        var precio = {tipo: '', precio: ''};


        //vm.mostrar = function(){
        //  console.log(vm.listProveedores);
        //};


        if (vm.id == 0) {

            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;

            NoticiasService.getNoticiaByID(vm.id, function (data) {
                //console.log(data);
                data.tipo = "" + data.tipo;
                vm.noticia = data;

            });
        }

        function deleteNoticia() {

            var r = confirm("Realmente desea eliminar el noticia? Esta operación no tiene deshacer. Si solo desea ocultarlo, cambie el estado a 'Inactivo'");
            if (r) {
                NoticiasService.deleteNoticia(vm.id, function (data) {
                    toastr.success('Noticia eliminado');
                    $location.path('/listado_noticias');
                });
            }
        }


        function comentarios() {
            $location.path('/comentarios/' + vm.id);
        }

        function save() {


            if (vm.isUpdate) {
                NoticiasService.save(vm.noticia, 'updateNoticia', function (data) {

                    console.log(data);
                    uploadImages();
                    NoticiasServiceUtils.clearCache = true;
                });
            } else {
                NoticiasService.save(vm.noticia, 'saveNoticia', function (data) {
                    uploadImages();
                    NoticiasServiceUtils.clearCache = true;
                });
            }
        }

        function deleteImage(name) {
            var r = confirm('Desea eliminar la imagen?');
            if (r) {
                vm.fotos.forEach(function (entry, index, array) {
                    if (entry.name === name) {
                        array.splice(index, 1);
                    }

                });

                vm.noticia.fotos.forEach(function (entry, index, array) {
                    if (entry.nombre === name) {
                        array.splice(index, 1);
                    }

                });


            }

        }

        function uploadImages() {
            //var files = document.getElementById("images");
            //console.log(files.files[0]);
            //console.log(vm.fotos);

            if (vm.fotos.length == 0) {
                return;
            }

            var form_data = new FormData();

            vm.fotos.forEach(function (entry) {

                //form_data.append('images', files.files[0]);
                //console.log(entry);
                form_data.append('images', entry);
            });

            var ajax = new XMLHttpRequest();
            ajax.onprogress = function () {

            };
            ajax.onload = function (data) {
                //console.log(data);

                toastr.success("Noticia guardado con éxito");
                $location.path('/listado_noticias');


            };
            ajax.open("POST", "./stock-api/upload.php");
            ajax.send(form_data);


        }

        function agregarImagen(filelist) {
            for (var i = 0; i < filelist.length; ++i) {
                var file = filelist.item(i);
                //do something with file; remember to call $scope.$apply() to trigger $digest (dirty checking)
                //imagesList.push(file);
                vm.fotos.push(file);
                foto = {};
                foto.foto = file.name;
                foto.main = 1;
                vm.noticia.fotos.push(foto);
                //console.log((vm.noticia.fotos));
            }
            $scope.$apply();
        }
    }

    function NoticiasServiceUtils() {
        //No limpia
        //this.clearCache = false;

        //limpia siempre
        this.clearCache = true;
    }


    function dbinfOnFilesSelectedNoticias() {
        return {
            restrict: 'A',
            scope: {
                //attribute data-dbinf-on-files-selected (normalized to dbinfOnFilesSelected) identifies the action
                //to take when file(s) are selected. The '&' says to  execute the expression for attribute
                //data-dbinf-on-files-selected in the context of the parent scope. Note though that this '&'
                //concerns visibility of the properties and functions of the parent scope, it does not
                //fire the parent scope's $digest (dirty checking): use $scope.$apply() to update views
                //(calling scope.$apply() here in the directive had no visible effect for me).
                dbinfOnFilesSelectedNoticias: '&'
            },
            link: function (scope, element, attr, Controller) {
                element.bind("change", function () {  //match the selected files to the name 'selectedFileList', and
                    //execute the code in the data-dbinf-on-files-selected attribute
                    scope.dbinfOnFilesSelectedNoticias({selectedFileList: element[0].files});
                });
            }
        }
    }

    NoticiasService.$inject = ['$http', '$cacheFactory', 'NoticiasServiceUtils', 'AcUtilsGlobals'];
    function NoticiasService($http, $cacheFactory, NoticiasServiceUtils, AcUtilsGlobals) {
        var service = {};
        var sucursal_id = 1;
        var clearCache = true;

        service.getNoticias = getNoticias;
        service.getNoticiaByID = getNoticiaByID;
        service.save = save;
        service.saveComentario = saveComentario;
        service.deleteNoticia = deleteNoticia;


        return service;

        function getNoticias(callback) {
            //var $httpDefaultCache = $cacheFactory.get('$http');
            //var cachedData = [];


            //if ($httpDefaultCache.get('./stock-api/noticias.php?function=getNoticias') != undefined) {
            //    if (NoticiasServiceUtils.clearCache) {
            //        $httpDefaultCache.remove('./stock-api/stock.php?function=getNoticias');
            //    }
            //    else {
            //        //console.log('lo');
            //        cachedData = $httpDefaultCache.get('./stock-api/noticias.php?function=getNoticias');
            //        callback(cachedData);
            //        return;
            //    }
            //}


            return $http.get('./stock-api/noticias.php?function=getNoticias', {cache: false})
                .success(function (data) {
                    //console.log(data);
                    //$httpDefaultCache.put('./stock-api/noticias.php?function=getNoticias', data);
                    //NoticiasServiceUtils.clearCache = false;

                    for (var i = 0; i < data.length; i++) {
                        var fecha = new Date(data[i].fecha);

                        data[i].fecha = new Date((fecha.getMonth() + 1) + '/' + fecha.getDate() + '/' + fecha.getFullYear());
                    }

                    callback(data);

                })
                .error(function (data) {

                });


        }


        function getNoticiaByID(id, callback) {
            getNoticias(function (data) {
                //console.log(data);
                var response = data.filter(function (entry) {
                    return entry.noticia_id === parseInt(id);
                })[0];
                //console.log(response);
                callback(response);
            })

        }

        function save(noticia, _function, callback) {

            return $http.post('./stock-api/noticias.php',
                {function: _function, noticia: JSON.stringify(noticia)})
                .success(function (data) {
                    //console.log(data);
                    callback(data);
                    clearCache = true;
                })
                .error(function (data) {

                });
        }


        function saveComentario(comentario, _function, callback) {

            return $http.post('./stock-api/noticias.php',
                {function: _function, comentario: JSON.stringify(comentario)})
                .success(function (data) {
                    //console.log(data);
                    callback(data);
                    clearCache = true;
                })
                .error(function (data) {

                });
        }


        function deleteNoticia(id, callback) {
            return $http.post('./stock-api/noticias.php',
                {function: 'deleteNoticia', id: id})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {

                });
        }

    }

})();