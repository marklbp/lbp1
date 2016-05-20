function changeBg(){
    var imgName = Math.floor(Math.random() * 15 );
    $("#bgAllImage").html("<img class='bgAllImage' src='images/im/"+imgName+".jpg' />");
}

changeBg();
