function fadeIn(div_name){
	document.getElementById(div_name).style.display = "none";
}

function openSearchBar(){
	fadeIn('searchBox');
	return 1;
}