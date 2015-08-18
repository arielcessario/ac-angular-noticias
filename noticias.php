<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);
if ($decoded != null) {
    if ($decoded->function == 'saveNoticia') {
        saveNoticia($decoded->noticia);

    }elseif($decoded->function == 'updateNoticia') {
        updateNoticia($decoded->noticia);

    }elseif($decoded->function == 'deleteNoticia') {
        deleteNoticia($decoded->noticia_id);

    }elseif($decoded->function == 'saveComentario') {
        saveComentario($decoded->comentario);

    }elseif($decoded->function == 'updateComentario') {
        updateComentario($decoded->comentario);

    }elseif($decoded->function == 'deleteComentario') {

        deleteComentario($decoded->comentario_id);
    }
} else {

    $function = $_GET["function"];
    if ($function == 'getNoticias') {
        getNoticias();
    }

}

function deleteComentario($comentario_id){

    $db = new MysqliDb();

    $db->where("noticia_comentario_id",  $comentario_id);
    $db->where("parent_id",  $comentario_id);
    $results = $db->delete('noticias_comentarios');

    echo json_encode(1);
}

function updateComentario($comentario){
    $db = new MysqliDb();

    $decoded = json_decode($comentario);

    $db->where('noticia_comentario_id', $decoded->noticia_comentario_id);

    $data = array("titulo" => $decoded->titulo,
        "detalles" => $decoded->detalles,
        "parent_id" => $decoded->parent_id,
        "votos_up" => 0,
        "votos_down" => 0);

    $results = $db->update('noticias_comentarios', $data);

    if(!$results){
        echo json_encode($db->getLastError());
        return;
    }

    echo json_encode(1);
}

function saveComentario($comentario){
    $db = new MysqliDb();

    $decoded = json_decode($comentario);


    $data = array("noticia_id" =>$decoded->noticia_id,
        "titulo" => $decoded->titulo,
        "detalles" => $decoded->detalles,
        "parent_id" => $decoded->parent_id,
        "votos_up" => 0,
        "votos_down" => 0);

    $results = $db->insert('noticias_comentarios', $data);

    if($results<0){
        echo json_encode($db->getLastError());
        return;
    }

    echo json_encode(1);

}

function deleteNoticia($noticia_id){

    $db = new MysqliDb();

    $results = $db->delete('noticias_fotos');
    $db->where("noticia_id",  $noticia_id);

    $results = $db->delete('noticias_fotos');
    $db->where("noticia_id",  $noticia_id);

    $results = $db->delete('noticias_comentarios');
    $db->where("noticia_id",  $noticia_id);

    echo json_encode(1);
}


function updateNoticia($noticia)
{
    $db = new MysqliDb();

    $decoded = json_decode($noticia);

    $db->where("noticia_id",  $decoded->noticia_id);

    $data = array("titulo" => $decoded->titulo,
        "detalles" => $decoded->detalles,
        "creador_id" => $decoded->creador_id,
        "vistas" => 0,
        "tipo" => $decoded->tipo,
        "fecha" => $decoded->fecha);

    $results = $db->update('noticias', $data);

    if(!$results){
        echo json_encode($db->getLastError());
        return;
    }

    $results = $db->delete('noticias_fotos');
    $db->where("noticia_id",  $decoded->noticia_id);

    $results = $db->delete('noticias_comentarios');
    $db->where("noticia_id",  $decoded->noticia_id);


    $db = new MysqliDb();
    foreach($decoded->fotos as $row){
        $data = array("noticia_id" => $decoded->noticia_id,
            "foto" => $row->foto,
            "main" => $row->main);

        $results = $db->insert('noticias_fotos', $data);

        if($results<0){
            echo json_encode($db->getLastError());
            return;
        }
    }

    foreach($decoded->comentarios as $row){
        $data = array("noticia_id" => $decoded->noticia_id,
            "titulo" => $row->titulo,
            "detalles" => $row->detalles,
            "parent_id" => $row->parent_id,
            "votos_up" => $row->votos_up,
            "votos_down" => $row->votos_down);

        $results = $db->insert('noticias_comentarios', $data);

        if($results<0){
            echo json_encode($db->getLastError());
            return;
        }
    }

    echo json_encode(1);
}



function saveNoticia($noticia)
{
    $db = new MysqliDb();

    $decoded = json_decode($noticia);

    $data = array("titulo" => $decoded->titulo,
        "detalles" => $decoded->detalle,
        "creador_id" => $decoded->creador_id,
        "vistas" => 0,
        "tipo" => $decoded->tipo);

    $results = $db->insert('noticias', $data);

    if($results<0){
        echo json_encode($db->getLastError());
        return;
    }

    foreach($decoded->fotos as $row){
        $data = array("noticia_id" => $row["noticia_id"],
            "foto" => $row["foto"],
            "main" => $row["main"]);

        $results = $db->insert('noticias_fotos', $data);

        if($results<0){
            echo json_encode($db->getLastError());
            return;
        }
    }

    echo json_encode(1);
}



function getNoticias()
{
    $db = new MysqliDb();
    $results = $db->rawQuery('Select noticia_id, titulo, detalles, fecha, creador_id, vistas, tipo, 0 fotos, 0 comentarios from noticias;');

    foreach($results as $key => $row){
        $db->where('noticia_id', $row["noticia_id"]);
        $fotos = $db->get('noticias_fotos');
        $results[$key]["fotos"] = $fotos;


        $db->where('noticia_id', $row["noticia_id"]);
        $comentarios = $db->get('noticias_comentarios');
        $results[$key]["comentarios"] = $comentarios;

    }


    echo json_encode($results);
}
