const buildingName = document.getElementById('building-name');
const buildingDesc = document.getElementById('building-description');
const buildingInfo = Object.freeze([
	{
		name: 'Delete Building',
		desc: 'Delete a building'
	},
	{
		name: 'Basic Housing',
		desc: 'Basic, old space housing. Nothing trans about it.<br>1 estrogen/second.',
		baseCost: 18,
		offset: -64
	},
	{
		name: 'Gender Clinic',
		desc: 'A cutesy little gender clinic for all your astronauts\' hormonal needs :3<br>5 estrogen + 0.1 testosterone/second.',
		baseCost: 100,
		offset: -64
	},
	{
		name: 'Spacious Housing',
		desc: 'Homely living space to skirt twirl all night :3<br>20 estrogen + 0.3 testosterone/second.',
		baseCost: 720,
		offset: -64
	},
	{
		name: 'Genderfluid Tank',
		desc: 'A storage tank for genderfluid to quench astronauts\' thirst<br>80 estrogen + 1 testosterone/second.',
		baseCost: 6000,
		offset: -64
	},
	{
		name: 'Hormone Caf&#233;',
		desc: 'A chill, fully pressurized, caf&#233; with the most delicious, hormone-infused food you\'ve ever eaten.<br>400 estrogen + 5 testosterone/second.',
		baseCost: 32500,
		offset: -64
	},
	{
		name: 'Enby Residences',
		desc: 'A place for beautiful, based and perfectly valid eldritch horrors :3<br>1250 estrogen + 25 testosterone/second.',
		baseCost: 480000,
		offset: -64
	},
	{
		name: 'Trans Center',
		desc: 'A large gender clinic and a commercial center for trans-related business.<br>10k estrogen + 100 testosterone/second',
		baseCost: 2700000,
		offset: -96
	},
	{
		name: 'Estrodome',
		desc: 'An oxygenated, estrogenated biodome.<br>75k estrogen + 800 testosterone/second',
		baseCost: 50000000,
		offset: -64
	},
	{
		name: 'Gender Condos',
		desc: 'Luxury space condos with free estrogen and testosterone provided :3<br>500k estrogen + 3000 testosterone/second',
		baseCost: 820000000,
		offset: -128
	},
	{
		name: 'Trans-scraper',
		desc: 'A large skyscraper featuring a gender clinic, a hormone bar, and fancy trans living spaces :3<br>12M estrogen + 10k testosterone/second',
		baseCost: 6250000000,
		offset: -192
	},
	{
		name: 'Estrogen Infinity',
		desc: 'Universe class gender-affirming care laboratories and pride events all Earth-year round :3<br>100M estrogen + 80k testosterone/second',
		baseCost: 7e10,
		offset: -256
	}
]);
const buildingsPurchased = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

let selectedBuilding = 0;
function selectBuilding(id){
	if(id==-1){
		buildingName.innerHTML='Lander';
		buildingDesc.innerHTML='Basic planetary lander that got you here. Generates a tiny amount of estrogen (0.2/second) to start your colony. Will be scrapped when population reaches 10.';
		return;
	}
	selectedBuilding=id&0xFF;
	if(selectedBuilding==100){
		buildingName.innerHTML='Double Estrogen Production';
		buildingDesc.innerHTML='Place anywhere to double your estrogen production.<br>Cost: '+formatNum(multiplierCost)+' testosterone<br>Current Multiplier: '+formatNum(multiplierPurchased);
		return;
	}
	buildingName.innerHTML=buildingInfo[id].name;
	buildingDesc.innerHTML=buildingInfo[id].desc+'<br>Cost: '+formatNum(getBuildingCost(id))+' estrogen';
}
function getBuildingCost(id){
	if(id==0){
		return 0;
	}
	else if(id==1 && buildingsPurchased[1]==0){
		return 2;
	}
	else if(id==1 && buildingsPurchased[1]==1){
		return 14;
	}
	else {
		let cost = buildingInfo[id].baseCost;
		for(let i=0;i<buildingsPurchased[id];i++){
			cost*=1.4;
		}
		if(cost<2147483647){
			return cost|0;
		}
		else {
			return cost;
		}
	}
}
