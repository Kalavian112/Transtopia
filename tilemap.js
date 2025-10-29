function getTilePosition(pos){
	return [(pos&7)*64-(pos>>3)*64+536, (pos&7)*32+(pos>>3)*32+256];
}
function getMouseTile(){
	const mouseTileX = ((((mouseY-256)/32)-((mouseX-600)/64))*0.5)|0;
	const mouseTileY = ((((mouseY-256)/32)+((mouseX-600)/64))*0.5)|0;
	if(mouseTileX>=0 && mouseTileX<8 && mouseTileY >= 0 && mouseTileY<8){
		return 8*mouseTileX+mouseTileY;
	}
	else {
		return -1;
	}
}
