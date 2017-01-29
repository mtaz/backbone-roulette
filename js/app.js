var App = {
  Models: {},
  Collections: {},
  Views: {}
}

//Models//
App.Models.Bet = Backbone.Model.extend({
  defaults:{
    number: "",
    betAmount:1,
    payout:1
  },
  initialize: function(){
    console.log("A bet has been added on " + this.get('number') + " with a payout of " + this.get('payout'));
  }
})

App.Models.Chip = Backbone.Model.extend({
  defaults: {
    x:0,
    y:0
  }
})

App.Models.Bank = Backbone.Model.extend({
  defaults:{
    total:100,
    betAmount:1,
    currentWager:0,
    resultText:"",
    payoutText:""
  },
  addTotal: function (num){
    this.set('total', this.get('total') + num);

  },

  subTotal: function (){
    if(this.get('total')<this.get('betAmount')){
      alert("You don't have enough money to make this bet!");
    } else{
      this.set('total', this.get('total') - this.get('betAmount'));
    }
  },

  incBet: function (){
    this.set('betAmount', this.get('betAmount')+1);
  },

  decBet: function (){
    if(this.get('betAmount') > 1){
      this.set('betAmount', this.get('betAmount')-1);
    }
  },

  incWager: function (){
    this.set('currentWager', this.get('currentWager') + this.get('betAmount'))
  },

  resetCW: function (){
    this.set('currentWager',0);
  },
})

//Collections//
App.Collections.Bets = Backbone.Collection.extend({
  model: App.Models.Bet,
  initialize: function(){}
})

App.Collections.Chips = Backbone.Collection.extend({
  model: App.Models.Chip,
  initialize: function(){}
})

//Views//
App.Views.GameTable = Backbone.View.extend({
  id: "board",
  template: _.template($("#game-table").html()),
  initialize: function(){

  },
  events: {
    "click area" : "onAddChip"
  },

  onAddChip: function(e){
    var bet = $(e.currentTarget).attr('value');
    console.log('bet',bet);
    window.onAddChip(e,bet);
  },
  render: function(){
    var gameTemplate = this.template();
    this.$el.html(gameTemplate);
    return this;
  }
})

App.Views.Bank = Backbone.View.extend({
  tagname: 'div',
  events: {
  "click #spin-wheel" : "onSpinWheel",
  "click #inc-bet"    : "onIncBet",
  "click #dec-bet"    : "onDecBet"
  },
  onSpinWheel: function(){
    //console.log("clicked spinwheel");
    window.onSpinWheel();
  },
  onIncBet: function(){
    //console.log('inc bet clicked');
    this.model.incBet();
    
  },
  onDecBet: function(){
    //console.log('dec bet clicked');
    this.model.decBet();

  },
  className: 'bank-display',
  template: _.template($("#bank-container").html()),
  initialize: function(){
    this.model.on("change",this.render,this);

  },

  render: function(){
    var bankTemplate = this.template(this.model.toJSON());
    this.$el.html(bankTemplate);
    return this;
  }

});

App.Views.Chip = Backbone.View.extend({
  tagname: 'div',
  className: 'chip',
  template: _.template($("#chip-container").html()),
  initialize: function(){

  },
  events: {

  },

  render: function(){
    var chipTemplate = this.template(this.model.toJSON());
    this.$el.html(chipTemplate);
    let x = this.model.get('x'),
        y = this.model.get('y');
    //console.log('chip',x,y);
    this.$el.css({top:y,left:x})
    return this;
  },
});

App.Views.Chips = Backbone.View.extend({
  tagname: 'div',
  className: 'chips-div',
  events: {

  },

  initialize: function(){
    this.collection.on( 'add', this.drawChip, this );
    this.collection.on( 'reset', this.clearChips, this );

  },

  clearChips: function(){
    $(".chip").remove();

  },

  render: function(){
    //console.log(this.collection.toJSON());
    this.collection.each(this.drawChip,this);

    return this;
  },

  drawChip: function(chip){
    //console.log('drawchip',this.collection.toJSON());
    var chipView = new App.Views.Chip({model: chip});

    this.$el.append(chipView.render().el);
  }
});

/////////////////////////////-----------------------------------------------------------------------------
