let gamemode = null;
let gameStarted = false;

document.getElementById('aredlbutton').addEventListener('click', async function(){
    gamemode = 'aredl'
    console.log('aredl time')
    await startGame()
})

document.getElementById('gddlbutton').addEventListener('click', async function(){
    gamemode = 'gddl'
    console.log('gddl time')
    await startGame()
})

async function fetchGDDLLevels(){
    let response = await fetch('https://skillsetguessr.rubypiec.workers.dev/?site=gddl&url='+encodeURIComponent('level/search?limit=25&page=0&sort=random&sortDirection=asc'));
    if(!response.ok){
        throw new Error(`Response status: ${response.status}`)
    }
    let levelList = await response.json();
    let filteredLevels = levelList["levels"].filter(level => level["Showcase"])
    if(filteredLevels.length == 0){
        return await fetchGDDLLevels()
    } else{
        return filteredLevels
    }
}

async function startGame(){
    document.body.style.overflowY = 'auto'
    document.getElementById('game').classList.remove('hidden')
    gameStarted = true
    if(gamemode!='aredl'&&gamemode!='gddl'){
        return;
    }
    document.getElementById('gmselscreen').style.display = 'none'
    if(gamemode=='gddl'){
        let levels = await fetchGDDLLevels()
        let nextLevel = levels[0]
        console.log(nextLevel)
        document.getElementById('ytvid').src = `https://www.youtube.com/embed/${nextLevel["Showcase"]}?autoplay=1`
    }
}

for(let j of tags){
    let option = document.createElement('option')
    option.value = j.Name
    option.innerHTML = j.Name
    
    document.getElementById('skillsets').appendChild(option)
}

new TomSelect("#skillsets",{
    plugins: {
		remove_button:{
			title:'Remove this item',
		}
	},
    allowEmptyOption: true,
	maxItems: 50
});

console.log(tags)