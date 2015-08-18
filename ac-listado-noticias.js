(function () {
    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length-1].src;
    //console.log(currentScriptPath);

    angular.module('ac.listadoNoticias', ['ngRoute'])
        .directive('acListadoNoticias', AcListadoNoticias);


    AcListadoNoticias.$inject = ['$location', '$route'];

    function AcListadoNoticias($location, $route) {
        return {
            restrict: 'E',
            scope: {
                parametro: '='
            },
            templateUrl: currentScriptPath.replace('.js', '.html'),
            controller: ListadoNoticiasController,

            controllerAs: 'listadoNoticiasCtrl'
        };
    }

    ListadoNoticiasController.$inject = ['acAngularLoginClientService','NoticiasService', '$location'];
    function ListadoNoticiasController(acAngularLoginClientService, NoticiasService, $location) {

        acAngularLoginClientService.checkCookie();

        var vm = this;

        vm.noticias = [];
        vm.detalle = detalle;

        function detalle(id){
            $location.path('/noticias/'+id);
        }

        NoticiasService.getNoticias(
            function (data){
                //console.log(data);
                //for(var i = 0; i<data.length; i++){
                //
                //    var fecha = data[i].fecha.getDate();
                //    console.log(fecha);
                //}
                vm.noticias = data;
            }
        );

    }

})();