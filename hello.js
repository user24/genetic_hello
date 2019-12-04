var target = '';
function fitness(chromosome){
    // higher fitness is better
    var f = 0; // start at 0 - the best fitness
    for(var i=0, c=target.length ; i<c ; i++) {
        // subtract the ascii difference between the target character and the chromosome character. Thus 'c' is fitter than 'd' when compared to 'a'.
        f -= Math.abs(target.charCodeAt(i)-chromosome[i]);
    }
    return f;
}

function chromosomeToString(chromosome) {
    // a chromosome is just an array of values. Usually binary, in our case integers between 0 and 255 - character codes.
    var str = '';
    for(var i=0, c=chromosome.length ; i<c ; i++) {
        str += String.fromCharCode(chromosome[i]);
    }
    return str;
}

function rand(min, max) {
    // Math.floor gives 'better' random numbers than Math.round, apparently.
    return Math.floor(Math.random()*(max-min+1))+min;
}

function letThereBeLight(populationSize, crossoverProb, mutationProb, targetString) {
    target = targetString;
    var numGenerations = 70;

    var generation = [];
    var avgFitness = 0;

    // seed population:
    generation[0] = [];
    for(var i=0 ; i<populationSize ; i++) {
        // next version - make the strings of different lengths!
        generation[0][i] = [];
        for(var j=0 ; j<target.length ; j++) {
            generation[0][i].push(rand(0,255));
        }
        avgFitness += fitness(generation[0][i]);
    }
    avgFitness /= populationSize;

    var yFactor = 3;
    var xFactor = 6;
    var outputSpace = 215;
    var canvas = document.getElementById("canvas");
    canvas.width = numGenerations*xFactor+outputSpace;
    canvas.height = Math.max(Math.abs(avgFitness/yFactor),300);
    var context = canvas.getContext("2d");
    context.font = '7pt Arial';
    context.fillStyle = 'rgb(255,255,255)';
    context.fillRect(0,0,canvas.width, canvas.height);
    context.strokeRect(0,0,canvas.width-outputSpace, canvas.height)

    context.fillStyle = 'rgb(200,200,200)';

    // draw generation lines
    for(var i=0 ; i<numGenerations ; i+=10) {
        context.beginPath();
        context.strokeStyle = "rgb(240,240,240)";
        context.moveTo(i*xFactor,0);
        context.lineTo(i*xFactor,canvas.height);
        context.stroke();
        context.closePath();
        context.beginPath();
        context.strokeStyle = "rgb(200,200,200)";
        context.fillText("<-Gen "+(i/10)*10, i*xFactor,10);
        context.closePath();
    }
    // draw fitness lines
    context.strokeStyle = "rgb(200,200,200)";
    var h = canvas.height/10;
    for(var p=100, i=0 ; i<canvas.height ; i+=h, p-=10) {
        context.beginPath();
        context.moveTo(0,i);
        context.lineTo(canvas.width-outputSpace,i);
        context.stroke();
        context.closePath();
        context.beginPath();
        context.fillText(p+"% fit", 3,i-3);
        context.closePath();
    }
    context.closePath();

    // write some key data
    context.fillStyle = 'rgb(255,255,255)';
    context.fillRect(188,125,200,140);
    context.strokeStyle = 'rgb(0,0,0)';
    context.strokeRect(188,125,200,140);
    context.fillStyle = 'rgb(0,0,0)';
    var x = 140;
    var lineHeight = 12;
    context.font = '12px Arial';
    context.fillText('Genetically Evolving "'+target+'"', 195,x); x+=lineHeight;
    context.fillText('in JavaScript. By Howard Yeend',195, x); x+=lineHeight*2;

    context.fillStyle = 'rgb(0,200,0)';
    context.fillText('Best Candidate', 195, x); x+=lineHeight;

    context.fillStyle = 'rgb(0,0,0)';
    context.fillText('Average Fitness', 195, x); x+=lineHeight;

    context.fillStyle = 'rgb(200,0,0)';
    context.fillText('Worst Candidate', 195, x); x+=lineHeight*2;

    context.fillStyle = 'rgb(0,0,0)';
    context.fillText("Population: "+populationSize+". Using Tournament", 195, x); x+=lineHeight;
    context.fillText("P(Crossover)="+crossoverProb+"  P(Mutation)="+mutationProb, 195, x); x+=lineHeight*2;

    context.fillText('details at www.puremango.co.uk',195, x); x+=lineHeight*2;

    var bestCandidate = {"fitness":canvas.height*yFactor+1};
    var worstCandidate = {"fitness":canvas.height*yFactor+1};

    // start evolving:
    var bestGen = numGenerations;
    numGenerations++;
    for(var gen=1 ; gen<numGenerations ; gen++) {
        // new generation starts empty:
        generation[gen] = [];
        // tournament selection:
        // take two random members of the population. Choose a random number r. If r>k, select fittest member, else select unfit member.
        // Repeat, breed. Higher k means fitter parents. Sometimes seemingly unfit parents carry important genes, so we don't just want to set k=1
        // Actually in this case k=1 makes it a lot faster. For a larger problem domain it probably wouldn't help so much...
        var r;
        var k = 1;
        var candidates = [];
        var parents = [];
        var crossoverPoint;
        // fill the new generation with as many candidates as the population size (pop remains constant from generation to generation)
        for(var i=0,c=populationSize ; i<c ; i+=2) {
            // choose parental candidates:
            for(var j=0 ; j<2 ; j++) {
                // chose random member of previous generation:
                r = rand(0,populationSize-1);
                candidates[0] = generation[gen-1][r];
                //do{
                    // chose random member of previous generation:
                    r = rand(0,populationSize-1);
                    candidates[1] = generation[gen-1][r];
                    // if we keep this loop, then we will
                    // keep choosing a new parent until we get two different parents:
                    // [1,2,3]==[1,2,3] is *false*. Hence we toString it to compare.
                    // BUT this only works on 1-d arrays. Be careful if you try to use this 'array comparison' operation elsewhere.
                    // it will PROBABLY NOT WORK FOR YOUR SCENARIO
                //} while(candidates[1].toString()==candidates[0].toString());
                // there's still a chance that we'll get two identical parents. We chose parents like this:
                /*
                rl = random candidate
                r2 = random candidate who is not r1
                parents0 = tournament(r1,r2)

                r1a = random candidate
                r2a = random candidate who is not r1a
                parents1 = tournament(r1a,r2a)

                so, we guarantee that no tournament takes place between identical parents
                but we do not guarantee that r1a and r2a are not equal to parents0
                */

                // run tournament to determine winning candidate:
                r = Math.random();
                if(fitness(candidates[0]) > fitness(candidates[1])) {
                    if(r<k) {
                        // keep fittest candidate
                        parents[j] = candidates[0];
                    } else {
                        parents[j] = candidates[1];
                    }
                } else {
                    if(r<k) {
                        // keep fittest candidate
                        parents[j] = candidates[1];
                    } else {
                        parents[j] = candidates[0];
                    }
                }
            }
            //output("Parents:"+parents[0]+" ("+fitness(parents[0])+") - "+parents[1]+" ("+fitness(parents[1])+")");

            // produce offspring:
            r = Math.random();
            if(r<crossoverProb){
                // perform crossover on parents to produce new children:
                crossoverPoint = rand(1,parents[0].length-2); // don't allow crossover to occur at the far ends of the chromosome - that's just a straight swap and therefore simply cloning.
                generation[gen][i] = parents[0].slice(0,crossoverPoint);
                generation[gen][i] = generation[gen][i].concat(parents[1].slice(crossoverPoint));

                generation[gen][i+1] = parents[1].slice(0,crossoverPoint);
                generation[gen][i+1] = generation[gen][i+1].concat(parents[0].slice(crossoverPoint));
            } else {
                // attack of the clones:
                generation[gen][i] = parents[0];
                generation[gen][i+1] = parents[1];
            }
            //output("Child1: "+generation[gen][i]+" (crossover @ "+crossoverPoint+")");
            //output("Child2: "+generation[gen][i+1]+" (crossover @ "+crossoverPoint+")");

            // mutate each child:
            for(var j=0 ; j<2 ; j++) {
                r = Math.random();
                if(r<mutationProb){
                    // chose a point in the chromosome to mutate - can be anywhere
                    mutationPoint = rand(0,generation[gen][i+j].length-1);
                    // working on a binary gene:
                    //generation[gen][i+j][mutationPoint] = !generation[gen][i+j][mutationPoint]+0; // quick bit flip
                    // working on our 256-valued gene:
                    // rather than just replacing the character at the mutation point with rand(0,255), we instead 'move' the character up to (n) place to the left or right as it were, where n is something pretty small like 5 or 10.
                    generation[gen][i+j][mutationPoint] += rand(-5,5);
                }
            }
            //output("Child1: "+generation[gen][i]+" (after mutation+ crossover @ "+crossoverPoint+")");
            //output("Child2: "+generation[gen][i+1]+" (after mutation)");

        }

        // now get average and best fitness and display:
        var previousAvg = avgFitness;
        var previousBest = bestCandidate.fitness;
        var previousWorst = worstCandidate.fitness
        worstCandidate.fitness =0;
        var avgFitness = f = 0;
        for(var j=0 ; j<populationSize ; j++) {
            //output("["+generation[gen][j]+'],',false);
            f = fitness(generation[gen][j])
            avgFitness += f;
            if(f > bestCandidate.fitness || j==0) {
                bestCandidate = {'candidate':generation[gen][j],"fitness":f};
            } else if(f<worstCandidate.fitness) {
                worstCandidate = {'candidate':generation[gen][j],"fitness":f};
            }
        }
        avgFitness /= populationSize;
        // draw avg graph
        context.beginPath();
        context.strokeStyle = "rgb(0,0,0)";
        context.moveTo((gen-1)*xFactor, Math.abs(previousAvg/yFactor));
        context.lineTo(gen*xFactor, Math.abs(avgFitness/yFactor));
        context.stroke();
        context.closePath();
        // draw best graph:
        context.beginPath();
        context.strokeStyle = "rgb(0,200,0)";
        context.moveTo((gen-1)*xFactor, Math.abs(previousBest/yFactor));
        context.lineTo(gen*xFactor, Math.abs(bestCandidate.fitness/yFactor));
        context.stroke();
        context.closePath();
        // draw worst graph:
        context.beginPath();
        context.strokeStyle = "rgb(200,0,0)";
        context.moveTo((gen-1)*xFactor, Math.abs(previousWorst/yFactor));
        context.lineTo(gen*xFactor, Math.abs(worstCandidate.fitness/yFactor));
        context.stroke();
        context.closePath();
        var bestStr = chromosomeToString(bestCandidate.candidate);
        //var worstStr = chromosomeToString(worstCandidate.candidate);

        if(gen==1 || gen%5==0 || gen==numGenerations-1) {
            context.fillText("Generation "+gen+" best: ["+bestStr+"]",canvas.width-outputSpace+2, gen*4+7);
        }
        if(bestCandidate.fitness==0 && bestGen+1==numGenerations) {
            bestGen = gen;
        }
    }
    document.getElementById('best').innerHTML = "["+bestStr+"] reached in "+bestGen+" generations";
};
