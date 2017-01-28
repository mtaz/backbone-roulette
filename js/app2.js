//instantiations
var gameTableView = new App.Views.GameTable();
$(".container").append(gameTableView.render().el);
var bankInst = new App.Models.Bank();
var bankView = new App.Views.Bank({model:bankInst});
$("#control").append(bankView.render().el);
var betsList = new App.Collections.Bets();
var chips = new App.Collections.Chips();
var chipsView = new App.Views.Chips({collection:chips});
$("#board").append(chipsView.render().el);


//functions to add bets, spin, change bet amount

function onAddChip(event,bet){
  // bet is a single chip on board - can represent up to 18 bets
  bankInst.set("payoutText","");//clear payout from last round
  bankInst.set("resultText","");//clear result from last round
  if(bankInst.get('total') < bankInst.get('betAmount')) {
    alert("You don't have enough money to make this bet!");
  } else {
    recordBets(bet);
    bankInst.subTotal();
    bankInst.incWager();
    addChip(event);
  }
}

// Moved to event in view
function onSpinWheel(){
  //return a random result from 0 (including 00) through 36
  function spinWheel(){
    let result = Math.floor(Math.random()*38)+1;
    if(result === 37){
      return "0";
    } else if(result === 38){
      return "00";
    } else {
      return result.toString();
    }
  }
  //checks models for winning bets, return payout total
  function payoutBets(bets,result){
    return bets.where({'number':result}).reduce(function(total,bet){
      return total + bet.get('payout');
    },0);
  }

  var result = spinWheel();
  //console.log("winning number is " + result);

  let payout = payoutBets(betsList,result);
  //console.log('payout is ', payout);
  bankInst.set("resultText","The winning number was " + result + ".");

  if(payout === 0){
    if(bankInst.get('currentWager') !== 0){
      bankInst.set("payoutText","Sorry, you lost.");
    }
  } else{
    bankInst.set("payoutText","You won " + payout + "!")
    bankInst.addTotal(payout);
  }

  bankInst.set('currentWager',0);
  chips.reset();
  betsList.reset();
}

// Moved to event in view
function onIncBet(){
  bankInst.incBet();
}

// Moved to event in view
function onDecBet(){
  bankInst.decBet();
}



//functions

//creates bet model instances and calculates payout based on odds
function recordBets(bet){
  //convert string value of bet to an array of bets
  function breakOutBets(bet){
  let nums = [];
  switch(bet){
    case "Odd":
      nums = [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35];
      break;
    case "Even":
      nums = [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36];
      break;
    case "Red":
      nums = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
      break;
    case "Black":
      nums = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
      break;
    case "1 Col":
      nums = [1,4,7,10,13,16,19,22,25,28,31,34];
      break;
    case "2 Col":
      nums = [2,5,8,11,14,17,20,23,26,29,32,35];
      break;
    case "3 Col":
      nums = [3,6,9,12,15,18,21,24,27,30,33,36];
      break;
    case "0-00-1-3":
      nums = [0,"00",1,2,3];
      break;
    case "00":
      nums = ["00"];
    default:
      var re = new RegExp("-");

      if(bet.match(re)){

        let num1 = bet.split("-")[0];
        let num2 = bet.split("-")[1];
        for (let i = num1; i <= num2; i++){
          nums.push(i);
        }
      } else {
        nums = bet.split(",");
      }
    }
  return nums.map(num=>num.toString());
}
  //returns payout based on number of numbers in a bet (must multiple * betAmount to find payout)
  function findPayoutMultiplier(nums){
    return Math.floor(36/nums.length);
  }
  let nums = [];
  let betAmount = bankInst.get('betAmount');
  nums = breakOutBets(bet);
  let payout = findPayoutMultiplier(nums)*betAmount;
  //create a model for each individual number in a bet and add to bets collection
  for(let i = 0; i < nums.length; i++){
    betsList.add(new App.Models.Bet({
      number: nums[i].toString(),
      betAmount: betAmount,
      payout: payout
    }));
  }
}
//return a random result from 0 (including 00) through 36

//checks models for winning bets, return payout total
function payoutBets(bets,result){
  return bets.where({'number':result}).reduce(function(total,bet){
    return total + bet.get('payout');
  },0);
}
//creat chip model instances
function addChip(event){
  //console.log('adding chip');
  let x = event.pageX;
  let y = event.pageY;
  let board = $('#board');
  var offset = board.offset();
  x -= parseInt(offset.left +5);
  y -= parseInt(offset.top +5);
  chips.add(new App.Models.Chip({x:x,y:y}));
}
