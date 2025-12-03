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

document.getElementById('diffrange').addEventListener('input', function(){
    let difficulty = document.getElementById('diffrange').value
    document.getElementById('difficulty').innerHTML = ` tier ${difficulty}`
    for(i=0;i<=4;i++){
        document.getElementsByClassName('difficulty')[i].classList.remove('selected')
    }
    if(difficulty<=5){
        document.getElementsByClassName('difficulty')[0].classList.add('selected')
    } else if(difficulty<=10){
        document.getElementsByClassName('difficulty')[1].classList.add('selected')
    } else if(difficulty<=15){
        document.getElementsByClassName('difficulty')[2].classList.add('selected')
    } else if(difficulty<=20){
        document.getElementsByClassName('difficulty')[3].classList.add('selected')
    } else{
        document.getElementsByClassName('difficulty')[4].classList.add('selected')
    }
})

async function fetchGDDLLevels(){
    let response = await fetch('https://skillsetguessr.rubypiec.workers.dev/?site=gddl&url='+encodeURIComponent('level/search?limit=25&page=0&sort=random&sortDirection=asc&loop=1&controls=0'));
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

let currentRound = 0;
let levelList;
let pointsperRound = Array(5)

let GDDLSkillsetSel

async function getRound(roundnum){ // WE ARE INDEXING AT **0**. ZERO IS THE FIRST ROUND. PLEASE DO NOT FORGET THIS.
    if(roundnum>levelList.length-1){
        let newBatch = await fetchGDDLLevels()
        levelList = levelList.concat(newBatch)
    }
    console.log(levelList[roundnum])
    document.getElementById('ytvid').src = `https://www.youtube.com/embed/${levelList[roundnum]["Showcase"]}?autoplay=1`
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
        document.getElementById("gddldiffsel").style.display = 'block'
        // SET UP SKILLSET CHOICES
        for(let j of gddltags){
            let option = document.createElement('option')
            option.value = j.Name
            option.innerHTML = j.Name
            
            document.getElementById('skillsets').appendChild(option)
        }

        GDDLSkillsetSel = new TomSelect("#skillsets",{
            plugins: {
                remove_button:{
                    title:'Remove this item',
                }
            },
            allowEmptyOption: true,
            maxItems: 7,
            onChange: function(){GDDLSkillsetSel.setTextboxValue()}
        });


        levelList = await fetchGDDLLevels()
        // let nextLevel = levelList[currentRound]
        await getRound(currentRound)
    }
    if(gamemode=='aredl'){
        // SET UP SKILLSET CHOICES
        for(let j of aredltags){
            let option = document.createElement('option')
            option.value = j
            option.innerHTML = j
            
            document.getElementById('skillsets').appendChild(option)
        }

        let aredlSkillsetSel = new TomSelect("#skillsets",{
            plugins: {
                remove_button:{
                    title:'Remove this item',
                }
            },
            allowEmptyOption: true,
            maxItems: 7
        });
    }
}

async function calculateGDDLPoints(roundNum, diffGuess, skillsetGuess){
    let levelID = levelList[roundNum]["ID"]
    let response = await fetch('https://skillsetguessr.rubypiec.workers.dev/?site=gddl&url='+encodeURIComponent('level/')+levelID+encodeURIComponent('/tags'));
    if(!response.ok){
        throw new Error(`Response status: ${response.status}`)
    }

    let difficulty = Math.round(levelList[roundNum]["Rating"])

    let skillsets = await response.json();
    let skillsetNames = skillsets.map(skillset => skillset.Tag.Name)

    console.log(skillsets)
    let totalSkillsetVotes;
    let highestSkillsetVotes = 0;
    for(i of skillsets){
        if(i.ReactCount>highestSkillsetVotes){highestSkillsetVotes = i.ReactCount} 
        totalSkillsetVotes+=i.ReactCount
    }

    let relevantSkillsets = skillsets.slice(0,7).filter(skillset => skillset.ReactCount > 0.2*highestSkillsetVotes) //only skillsets with a decent majority (20%), and also only the first 7
    let relevantSkillsetNames = relevantSkillsets.map(skillset => skillset.Tag.Name)

    let points = Math.sqrt(49-3*(difficulty-diffGuess)**2)*1250/7;
    if(isNaN(points)){
        points = 0
    }
    console.log(relevantSkillsets)

    let totalRelevantVotes = 0;
    for(i of relevantSkillsets){ // This is so poorly coded LMAOOo
        totalRelevantVotes+=i.ReactCount
    }

    for(let i of skillsetGuess){
        let positionInSkillsets = skillsetNames.indexOf(i)
        // let positionInRelevant = relevantSkillsetNames.indexOf(i) <---- ironically, irrelevant
        if(skillsetNames.includes(i)){
            let skillset = skillsets[positionInSkillsets]
            if(relevantSkillsetNames.includes(i)){
                points+=skillset.ReactCount/totalRelevantVotes*3750
                console.log('Wow, ' + i + '! +' + skillset.ReactCount/totalRelevantVotes*3750)
            } else{
                if(skillsetNames.slice(0,7).includes(i)){ // Check if it's at least in the top 7
                    console.log('kinda irrelevant but ok ' + i) // If it is, no worries!
                } else{
                    // BAD GUESS
                    console.log(i + ' nuh uh. -750')
                    points -= 750
                }
            }
        } else{
            console.log(i + ' nuh uh. -750')
            points -= 750
        }
    }

    return points;
}

async function submitguess(){
    let points;
    if(gamemode=='gddl'){
        points = await calculateGDDLPoints(currentRound, Number(document.getElementById('diffrange').value), GDDLSkillsetSel.getValue())
        GDDLSkillsetSel.setValue()
    }
    console.log(points)

    currentRound++
    await getRound(currentRound)
}

document.getElementById('submitguess').addEventListener('click', async function(){await submitguess()})