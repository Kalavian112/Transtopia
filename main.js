const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d',{alpha:false});
const resolution = window.innerWidth;
const tileCount = 64;
const images = {
	mapBackground: loadImage('assets/images/map_background.png',1024,512),
	mouseTile: loadImage('assets/images/tile_selected.png',128,64),
	centralBase: loadImage('assets/images/buildings/building_0.png',128,128),
	gameTiles: [
		loadImage('assets/images/buildings/building_1.png',128,128),
		loadImage('assets/images/buildings/building_2.png',128,128),
		loadImage('assets/images/buildings/building_3.png',128,128),
		loadImage('assets/images/buildings/building_4.png',128,128),
		loadImage('assets/images/buildings/building_5.png',128,128),
		loadImage('assets/images/buildings/building_6.png',128,128),
		loadImage('assets/images/buildings/building_7.png',128,160),
		loadImage('assets/images/buildings/building_8.png',128,128),
		loadImage('assets/images/buildings/building_9.png',128,192),
		loadImage('assets/images/buildings/building_10.png',128,256),
		loadImage('assets/images/buildings/building_11.png',128,256),
	]
}
const eCount = document.getElementById('estrogen-count');
const tCount = document.getElementById('testosterone-count');
const popCount = document.getElementById('population-count');

const tiles = new Uint8Array(tileCount);
let estrogen = 0, ePerSec = 0, testosterone = 0; tPerSec = 0, maxPopulation = 4, currentPopulation = 4, multiplierPurchased = 0, estrogenMultiplier = 1, multiplierCost = 100000;
let mouseX = 0, mouseY = 0, mouseTile = 0, saveTimer = 180;
let numParticle = 0, numX = 0, numY = 0, numText = '';
let landerPresent = true, gameStarted = false;

document.addEventListener('mousemove', (e)=>{
	const rect = canvas.getBoundingClientRect();
	mouseX = int32((e.clientX - rect.left)*1200/rect.width);
	mouseY = int32((e.clientY - rect.top)*900/rect.height);
});
// initialize game
for(let i=0;i<tileCount;i++){
	tiles[i]=0;
}
try{
	loadGame();
} catch(e) {
	console.log('An error occurred loading save data');
}
updateStats();

setInterval(gameTick, 33);
let lastTime = performance.now();
function gameTick(){
	if(gameStarted){
		const currentTime = performance.now();
		const delta = (currentTime-lastTime)/1000;
		lastTime = currentTime;
		// update hormones
		estrogen+=ePerSec*delta*estrogenMultiplier;
		testosterone+=tPerSec*delta;
		eCount.innerHTML=formatNum(estrogen);
		tCount.innerHTML=formatNum(testosterone);
		// update population
		if(maxPopulation-currentPopulation<0.1){
			currentPopulation=maxPopulation;
		}
		else {
			currentPopulation = currentPopulation+0.05*delta*(maxPopulation-currentPopulation);
		}
		popCount.innerHTML=formatNum(currentPopulation);
		// remove lander when population reaches 10
		if(landerPresent==true && currentPopulation>=10){
			landerPresent = false;
			estrogen+=50;
			spawnNumber(50,0,536,416);
		}
		if(numParticle>0){
			numParticle-=delta;
			if(numParticle<0){
				numParticle=0;
			}
		}
		saveTimer-=delta;
		if(saveTimer<=0){
			saveTimer+=150;
			saveGame();
		}
		gameRender();
	}
}	

function gameRender(){
	// reset background
	ctx.fillStyle='#000000ff';
	ctx.fillRect(0,0,1200,900);
	ctx.drawImage(images.mapBackground,88,256);
	// draw mouse tile
	mouseTile = getMouseTile();
	const [tileX, tileY] = getTilePosition(mouseTile);
	if(mouseTile>=0){
		ctx.drawImage(images.mouseTile,tileX,tileY);
	}
	// draw game tiles
	for(let i=0;i<tileCount;i++){
		if(landerPresent==true && i==27){ // draw base
			ctx.drawImage(images.centralBase,536,384);
			continue;
		}
		const [xPos, yPos] = getTilePosition(i);
		const tile = tiles[i];
		if(tile>0){
			ctx.drawImage(images.gameTiles[tile-1], xPos, yPos+buildingInfo[tile].offset);
		}	
	}
	// draw transparent building
	if(mouseTile>=0 && selectedBuilding>0 && selectedBuilding<100){
		ctx.globalAlpha=0.5;
		ctx.drawImage(images.gameTiles[selectedBuilding-1], tileX, tileY+buildingInfo[selectedBuilding].offset);
		ctx.globalAlpha=1;
	}
	// draw floating number
	if(numParticle>0){
		ctx.font='32px URW Gothic';
		ctx.fillStyle = 'rgba(255, 255, 255, '+numParticle+')';
		ctx.fillText(numText,numX,numY-((1-numParticle)*20));
	}
	// draw save text
	if(saveTimer<5){
		ctx.fillStyle='#ffffffff';
		ctx.font='16px URW Gothic';
		ctx.fillText('saving in '+((saveTimer|0)+1),1108,24);
	}
}
function placeBuilding(){
	if(mouseTile>=0){
		if(landerPresent==true && mouseTile==27){
			selectBuilding(-1);
			return;
		}
		if(selectedBuilding==0){ // delete building
			const b = tiles[mouseTile];
			if(b==0){
				return;
			}
			let est = (1.8*b*b*b) | 0;
			if(est<2){
				est = 2; // prevent softlock
			}
			spawnNumber(est,0,mouseX,mouseY);
			estrogen+=est;
			buildingsPurchased[tiles[mouseTile]]-=1;
			tiles[mouseTile]=0;
		}
		else if(selectedBuilding==100){
			if(testosterone>=multiplierCost){
				multiplierPurchased+=1;
				testosterone-=multiplierCost;
				updateMult();
				selectBuilding(100);
			}
		}
		else if(tiles[mouseTile]>0){
			return;
		}
		else {
			// buy building
			const cost = getBuildingCost(selectedBuilding);
			if(estrogen>=cost){
				estrogen-=cost;
				spawnNumber(cost,true,mouseX,mouseY);
				buildingsPurchased[selectedBuilding]+=1;
				tiles[mouseTile]=selectedBuilding;
				selectBuilding(selectedBuilding);
			}
		}
	}	
	updateStats();
}

function loadImage(path, width, height){
	const a = new Image(width, height);
	a.src=path;
	return a;	
}
function updateStats(){
	let totalE = 2; //tenths
	let totalT = 0; //tenths
	let totalMaxPop = 4;
	for(let i=0;i<tileCount;i++){
		switch(tiles[i]){
			case 1:
				totalE+=10;
				totalMaxPop+=2;
				break;
			case 2:
				totalE+=50;
				totalT+=1;
				totalMaxPop+=5;
				break;
			case 3:
				totalE+=200;
				totalT+=3;
				totalMaxPop+=25;
				break;
			case 4:
				totalE+=800;
				totalT+=10;
				totalMaxPop+=20;
				break;
			case 5:
				totalE+=4000;
				totalT+=50;
				totalMaxPop+=20;
				break;
			case 6:
				totalE+=12500;
				totalT+=250;
				totalMaxPop+=75;
				break;
			case 7:
				totalE+=100000;
				totalT+=1000;
				totalMaxPop+=75;
				break;
			case 8:
				totalE+=750000;
				totalT+=8000;
				totalMaxPop+=75;
				break;
			case 9:
				totalE+=5000000;
				totalT+=30000;
				totalMaxPop+=500;
				break;
			case 10:
				totalE+=1.2e8;
				totalT+=100000;
				totalMaxPop+=1000;
				break;
			case 11:
				totalE+=1e9;
				totalT+=800000;
				totalMaxPop+=5000;
				break;
		}
	}
	ePerSec = totalE/10;
	tPerSec = totalT/10;
	maxPopulation = totalMaxPop;
}
function updateMult(){
	let cost = 100000;
	let mult = 1;
	for(let i=0;i<multiplierPurchased;i++){
		cost*=10;
		mult*=2;
	}
	multiplierCost = cost;
	estrogenMultiplier = mult;
}
function spawnNumber(num, sign, x, y){
	numParticle=1;
	let numberText = formatNum(num);
	if(sign==true){
		numText='-'+numberText;
	}
	else {
		numText='+'+numberText;
	}
	numX = x;
	numY = y;
}
function saveGame(){
	const gameData = {
		estrogen: Math.floor(estrogen),
		testosterone: Math.floor(testosterone),
		population: currentPopulation|0,
		buildingsPurchased: buildingsPurchased,
		multiplierPurchased: multiplierPurchased|0,
		landerPresent: landerPresent,
		cityTiles: tiles
	}
	localStorage.setItem('gameData',JSON.stringify(gameData));
}
function loadGame(){
	const jsonData = JSON.parse(localStorage.getItem('gameData'));
	for(let i=0;i<tileCount;i++){
		tiles[i]=jsonData.cityTiles[i]&0xFF;
	}
	for(let i=0;i<jsonData.buildingsPurchased.length;i++){
		buildingsPurchased[i]=jsonData.buildingsPurchased[i];
	}
	gameStarted=true;
	canvas.style.display='block';
	document.getElementById('intro-div').style.display='none';
	estrogen=jsonData.estrogen;
	testosterone=jsonData.testosterone;
	currentPopulation=jsonData.population;
	multiplierPurchased=jsonData.multiplierPurchased|0;
	landerPresent=jsonData.landerPresent;
	updateStats();
	updateMult();
}
