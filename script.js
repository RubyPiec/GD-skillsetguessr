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
    let response = await fetch('https://skillsetguessr.rubypiec.workers.dev/?site=gddl&url='+encodeURIComponent('level/search?limit=25&page=0&sort=random&sortDirection=asc&minDeviation=0.01&minSubmissionCount=5'));
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

let maxRound = 5; // THIS IS **NOT** BEING INDEXED AT 0. THIS IS JUST THE AMOUNT OF ROUNDS THERE ARE.

let currentRound = 0;
let levelList;

let pointsperRound = Array(maxRound)
let totalpoints = 0;
let offset = 0;

let GDDLSkillsetSel

async function getRound(roundnum){ // WE ARE INDEXING AT **0**. ZERO IS THE FIRST ROUND. PLEASE DO NOT FORGET THIS.
    if(roundnum+1>maxRound){
        console.log('game beaten :3')
        openRecap(roundnum)
        return;
    }
    document.getElementById('gameover').classList.add('hidden')
    document.getElementById('roundover').classList.remove('hidden')
    if(roundnum>levelList.length-1){
        let newBatch = await fetchGDDLLevels()
        levelList = levelList.concat(newBatch)
    }
    console.log(levelList[roundnum])
    document.getElementById('ytvid').src = `https://www.youtube.com/embed/${levelList[roundnum]["Showcase"]}?autoplay=1&enablejsapi=1&loop=1`
}

async function startGame(){
    offset = 0;
    currentRound = 0;
    levelList = [];
    pointsperRound = Array(maxRound)
    totalpoints = 0;

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
            onChange: function(){GDDLSkillsetSel.setTextboxValue(); GDDLSkillsetSel.close()}
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

let skillsetsPerLevel = Array(maxRound)

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

    skillsetsPerLevel[roundNum] = skillsets

    let relevantSkillsets = skillsets.slice(0,7).filter(skillset => skillset.ReactCount > 0.2*highestSkillsetVotes) //only skillsets with a decent majority (20%), and also only the first 7
    let relevantSkillsetNames = relevantSkillsets.map(skillset => skillset.Tag.Name)

    let points = Math.sqrt(49-3*(difficulty-diffGuess)**2)*1250/7;
    if(isNaN(points)){
        points = 0
    }
    console.log(relevantSkillsets)

    let totalRelevantVotes = 0;
    for(i of relevantSkillsets){ // This is so poorly coded LMAOOo // i barely fucking know what i was doing tbh
        totalRelevantVotes+=i.ReactCount
    }

    let multiplier = 1 //used for bad guess

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
                    console.log(i + ' nuh uh. -5%')
                    multiplier *= 0.95
                }
            }
        } else{
            console.log(i + ' nuh uh. -10%')
            multiplier *= 0.9
        }
    }

    return points*multiplier;
}

let skillsetGuessesPerRound = Array(maxRound)

async function openRecap(roundnumber){
    if(roundnumber+1>maxRound){
        document.getElementById('non1roundstats').innerHTML = ''
        document.getElementById('gameoverpoints').innerHTML = Math.round(totalpoints) + '/' + 5000*maxRound + ' points'
        document.getElementById('roundstats1').children[0].innerHTML = `Round 1: ${Math.round(pointsperRound[0])}/5000`
        for(let i=1; i<maxRound; i++){
            let round = document.getElementById('roundstats1').cloneNode(true)
            round.id = 'roundstats' + (i+1)
            round.children[0].innerHTML = `Round ${i+1}: ${Math.round(pointsperRound[i])}/5000`
            round.children[1].addEventListener('click', async function(){
                await openRecap(i)
            })

            document.getElementById('non1roundstats').appendChild(round)
        }
        document.getElementById('roundstats1').children[1].addEventListener('click', async function openr(){
            await openRecap(0)
        })
        document.getElementById('gameover').classList.remove('hidden')
        document.getElementById('roundover').classList.add('hidden')
        document.getElementById('recap').classList.remove('hidden')
        console.log('game beaten :3')

        return;
    }

    document.getElementById('roundover').classList.remove('hidden')
    document.getElementById('gameover').classList.add('hidden')

    document.getElementById('recappoints').innerHTML = `+${Math.round(pointsperRound[roundnumber])}/5000 points`

    document.getElementById('skillsetlist').innerHTML = ''


    let maxSkillset = skillsetsPerLevel[roundnumber][0].ReactCount
    for(let i of skillsetsPerLevel[roundnumber]){
        let skillset = document.createElement('span') 
        skillset.innerHTML = i.Tag.Name
        skillset.classList.add('skillsettype')
        let rarity = i.ReactCount

        let authorName = levelList[roundnumber]["Meta"]["Publisher"]["name"]
        document.getElementById('levelName').innerHTML = `${levelList[roundnumber]["Meta"]["Name"]} by ${authorName ? authorName : '-'}`
        document.getElementById('levelName').href = `https://gdladder.com/level/${levelList[roundnumber]["ID"]}`

        document.getElementById('actualdifficulty').innerHTML = `(t${Math.round(levelList[roundnumber]["Rating"])})`
        document.getElementById('diffprediction').innerHTML = `You thought: t${diffPredictionsPerRound[roundnumber]}`

        let amount = document.createElement('span')
        amount.innerHTML = `(${rarity})`
        amount.classList.add('skillsetrarity')
        if(skillsetsPerLevel[roundnumber].slice(0,7).includes(i)){
            if(rarity>maxSkillset*0.2){
                skillset.classList.add('relevant') //renevant by nikrodox
            }
        } else{
            skillset.classList.add('irrelevant') //irrenevant by irnikrodox?
        }
        skillset.appendChild(amount)
        document.getElementById('skillsetlist').appendChild(skillset)
    }

    document.getElementById('yourskillsetlist').innerHTML = ''
    for(let j of skillsetGuessesPerRound[roundnumber]){
        let selfSkillset = document.createElement('span')
        selfSkillset.innerHTML = j
        selfSkillset.classList.add('skillsettype')

        let maxSkillset = skillsetsPerLevel[roundnumber][0].ReactCount
        if(skillsetsPerLevel[roundnumber].map(skillset => skillset.Tag.Name).includes(j)){
            if(skillsetsPerLevel[roundnumber][skillsetsPerLevel[roundnumber].map(skillset => skillset.Tag.Name).indexOf(j)].ReactCount>maxSkillset*0.2){
                selfSkillset.classList.add('relevant')
            }
        } else{
            selfSkillset.classList.add('irrelevant')
        }

        document.getElementById('yourskillsetlist').appendChild(selfSkillset)
    }

    document.getElementById('recap').classList.remove('hidden')
}

document.getElementById('nextround').addEventListener('click', async function(){
    currentRound++
    document.getElementById('recap').classList.add('hidden')
    await getRound(currentRound)
    GDDLSkillsetSel.setValue([])
})

let diffPredictionsPerRound = Array(5)

async function submitguess(){
    document.getElementById('ytvid').src=''
    let points;
    if(gamemode=='gddl'){
        skillsetGuessesPerRound[currentRound] = [...GDDLSkillsetSel.getValue()]
        console.log(skillsetGuessesPerRound[currentRound])
        points = await calculateGDDLPoints(currentRound, Number(document.getElementById('diffrange').value), GDDLSkillsetSel.getValue())
    }
    console.log(points)

    pointsperRound[currentRound] = points
    totalpoints += points

    diffPredictionsPerRound[currentRound] = document.getElementById('diffrange').value

    document.getElementById('pointcount').innerHTML = `${Math.round(totalpoints)} points`
    openRecap(currentRound)
}

document.getElementById('submitguess').addEventListener('click', async function(){await submitguess()})