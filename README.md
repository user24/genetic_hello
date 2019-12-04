This article works through the creation of a ‘toy’ genetic algorithm which starts with a few hundred random strings and evolves towards the phrase “Hello World!”. It’s a toy example because we know in advance what the optimum solution is – the phrase “Hello World!” – but it provides a nice simple introduction to evolutionary algorithms.

I have written this article primarily for developers who have a casual interest in machine learning. I don’t talk much about the implementation of the code itself because there’s not much of interest there – the beauty of genetic algorithms is their simplicity, so the code isn’t that interesting, other than in as much as it’s not usual to do such things in JavaScript. For ‘real’ applications of genetic algorithms, I’d suggest looking into existing established frameworks for your language.

The code isn’t nicely packaged into a reusable library or anything, but you can see how I’ve implemented the main genetic operations. The graphing code gets in the way a bit too, but hopefully you can see past that.

In short, a typical genetic algorithm works like this:

Represent solutions as binary strings (called chromosomes). Create a random population of a few hundred candidate solutions. Select two parents from the population and breed them to create two offspring. Sometimes mutate the children in some way. Repeat the selection/breeding/mutation cycle until you reach a desired level of fitness.

In more detail, genetic algorithms are comprised of the following concepts:

1. A chromosome which expresses a possible solution to the problem as a string
1. A fitness function which takes a chromosome as input and returns a higher value for better solutions
1. A population which is just a set of many chromosomes
1. A selection method which determines how parents are selected for breeding from the population
1. A crossover operation which determines how parents combine to produce offspring
1. A mutation operation which determines how random deviations manifest themselves

Now let’s work through a specific problem – the genetic Hello World algorithm:

##Constructing The Chromosome
“The human genome itself is just a parts list” – Eric Lander

Exactly how you encode solutions will depend heavily on your problem. We encode solutions as arrays of integers, which can be thought of as analogous to strings of characters. For example we see the array [97,98,99] as equivalent to the string “abc” because the ascii value of ‘a’ is 97, ‘b’ is 98, ‘c’ is 99. So our chromosomes are essentially just strings. It is more usual for a GA to use a binary string for the chromosome.

##The Fitness Function
"I have called this principle, by which each slight variation, if useful, is preserved, by the term of Natural Selection" -  Charles Darwin

In order to know which chromosomes are better solutions, we need a way to judge them. For this, we use a fitness function. Even within one problem, there can be various possible fitness functions. We want strings that are closer to “Hello World!” to be classed as more fit. How could we achieve this? Some possibilities which I considered:

Return a count of the characters from the chromosome which are in the target string. Thus “eHllo World!” would be fitter than “Gello World!”, but exactly as fit as “Hello World!”.

Return a count of characters from the chromosome which are in the right place, thus “HxxloxWxxxxx” would have a fitness of 4, and “Hello World!” would have a fitness of 12. This is better, but too coarse – there are only 12 possible levels of fitness.

The fitness function I decided on was the following:

Return the sum of the character-wise differences between the chromosome and the target string. Thus “Hello Xorld!” has a fitness of -1 because X is one letter away from W, while “Hello Yorld!” has a fitness of -2 because Y is two characters away from W. This measure is quite rich; there are many different possible fitness levels, and it’s quite expressive. In the code, we implement this like so:

  function fitness(chromosome){
    // higher fitness is better
    var f = 0; // start at 0 - the best fitness
    for(var i=0, c=target.length ; i<c ; i++) {
      // subtract the ascii difference between the target char and the chromosome char
      // Thus 'c' is fitter than 'd' when compared to 'a'.
      f -= Math.abs(target.charCodeAt(i)-chromosome[i]);
    }
    return f;
  }

##The Population
"Society exists only as a mental concept; in the real world there are only individuals." – Oscar Wilde

We must start with an initial population, so we start by creating 400 totally random 12 character strings. To make things more interesting, the strings aren’t just made up of random alphanumerics – instead we pick characters from any of the 256 possible ascii characters.

##Unnatural Selection
"Parentage is a very important profession, but no test of fitness for it is ever imposed in the interest of the children." - George Bernard Shaw

In nature, all kinds of factors contribute towards whether individuals get the chance to pass on their genetic code or not. Beer is often involved.

In genetic algorithms, we can choose from a number of specific selection methods, some of which are outlined here:

###Elitism:

We may decide to be quite fascist and only allow the top 25% to breed. This can actually work very well! There are risks however – firstly, some currently-unfit individual may be carrying a trait which would have later helped the population, secondly this will reduce the diversity of the population – you may be breeding out other good approaches. For example, there might be a type of solution which quickly outperforms other candidates at the start, but then can’t go much further, while another type of solution might slowly become fitter and fitter and eventually overtake the first type. By choosing the “elite” method of selection you could make your population susceptible to these problems, especially if there are multiple good answers. It’s not so much a problem if there’s only one correct solution; you won’t need population diversity.

###Roulette Wheel:

Another approach is to pick members with a probability according to their fitness; thus fitter candidates are more likely to be selected, but unfit candidates are not precluded from selection. This is a popular method, but if there is an unusually fit candidate it will dominate the mating pool, again reducing diversity.

###Tournament:

This is the selection model I am using. In this, we take two members of the population at complete random and keep the fittest as the first parent, then do the same with another two members and keep the fittest as the other parent. This has the advantage that it’s faster than elitism (where you have to rank all candidates by fitness), still favours fitter candidates over unfit ones, and doesn’t allow one particularly fit candidate to dominate.

In the future, I’d probably recommend some hybrid selection method which, say, keeps the top 10% (elitism), and uses tournament selection for the remaining 90%; this way the very best candidates have no chance of being lost, but the population remains diverse.

##Mating Candidates
"We are all gifted. That is our inheritance." – Ethel Waters

Now we’ve chosen two good candidates, we want to ensure their genes survive in the next generation. Sometimes we’ll just clone the parents to create 2 children, but more often (usually between 60% and 100% of the time), we mix the parents chromosomes together very simply – blindly even – by applying an operation called crossover. Let’s say we’d chosen the following parents:

"Hellh Grrld" and "Grllo Worlk"

We chose a random point in the string, say the 4th character, indicated here with a forward slash:

"Hell/h Grrld" and "Grll/o Worlk"

and we just swap everything before that crossover point to create two offspring:

"Grllh Grrld" and "Hello Worlk"

Well, the first child isn’t very fit and probably won’t get selected the next time, but the second child is a really good candidate- only one character is wrong. Moreover, this second child is fitter than either of the two parents. Way to go, kid!

##Mutation
"Evolutionary plasticity can be purchased only at the ruthlessly dear price of continuously sacrificing some individuals to death from unfavourable mutations" – Theodosius Dobzhansky

Finally, we sometimes mutate the children just slightly before releasing them back into the population. Let’s imagine that we’d created our population of random strings but that none of them started with a “H”. No amount of crossover could ever produce the vital “H” we need to reach the perfect solution. So very occasionally, we’ll mutate one of the characters in the chromosome, introducing a never-before seen gene just in case it happens to be exactly what we want.

Most mutations won’t be beneficial – if we mutated our “Hello Worlk” child, the chances of randomly producing a beneficial mutation are slim – we have a 1 in 11 chance of choosing the right character; any other position will decrease fitness, and then we have to choose one of the characters between d and k in order to make an improvement; again, anything else will decrease fitness. So mutation usually occurs with a very low probability, sometimes as low as 0.001% depending on the problem. Our mutation rate is high (20%) because we will need to generate new characters, and my approach to mutation limits the destructive potential.

There are a number of ways to approach mutation. In a binary string, we would mutate simply by flipping one of the bits. In our example, I do a slightly more clever mutation. Rather than choosing a random position and changing the character to a random one between 0 and 255, I chose a random position and alter the character that’s there by up to 5 places. So a ‘k’ could become anything between ‘g’ and ‘p’, but never anything outside that bracket. This helps to ensure that mutations aren’t too destructive – the maximum impact on the fitness score is 5 points.

##Running the Algorithm
"Life is just one damned thing after another" -Elbert Hubbard

Now we’ve got all the building blocks defined, running the algorithm is simply a matter of performing selection and breeding again and again until either a certain number of generations have gone by, or we reach a desired level of fitness.

##The End
"In the beginning the Universe was created. This has made a lot of people very angry and has been widely regarded as a bad move." – Douglas Adams.

Thanks for reading this far. I hope I haven’t misrepresented genetic algorithms, but I’m sure I’ve made a mistake or two along the way. Please let me know in the comments and I’ll try to update the code or text accordingly.

The JavaScript code is unremarkable. In fact it’s pretty ugly – the graphing code particularly, it’s all mixed up with the main loop, there are a few optimisations I could add (for instance processing the GA in chunks with setInterval would allow you to run it for hundreds of generations instead of being limited to 100 or so before your browser locks up!), but as a toy demo I think it works pretty well. Maybe one day I’ll clean it up. Or maybe you will do it for me! Improvements are very welcome.

Update: There’s some great discussion on Hackernews (https://news.ycombinator.com/item?id=2002673) and reddit (https://www.reddit.com/r/MachineLearning/comments/elbqx/genetic_algorithm_for_hello_world_in_javascript/) about this post. Thanks for all the positive feedback :0)
