function int32(a){
	return a|0;
}
function formatNum(a){
	if(a<1000){
		return String(a|0);
	}
	else if(a<1000000){
		return String(int32(a/1000)+'.'+int32(a/100)%10+int32(a/10)%10+'k');
	}
	else if(a<1e9){
		return String(int32(a/1e6)+'.'+int32(a/1e5)%10+int32(a/1e4)%10+'M');
	}
	else if(a<1e12){
		return String(int32(a/1e9)+'.'+int32(a/1e8)%10+int32(a/1e7)%10+'B');
	}
	else if(a<1e15){
		return String(int32(a/1e12)+'.'+int32(a/1e11)%10+int32(a/1e10)%10+'T');
	}
	else {
		const l = Math.log10(a)|0;
		return (int32(a/Math.pow(10,l-3))/1000)+'e'+l;
	}
}
