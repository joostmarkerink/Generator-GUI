var jm_identifier_counter=1;

function JMCreateID(){
  return 'jm_'+jm_identifier_counter++;
}

function Generator(query,options){
  this.target=query;
  this.index=Generator.all.length;
  Generator.all.push(this);
  this.interface=document.createElement('DIV');
  this.interface.id='generator_'+this.index;
  this.interface.classList.add('generator');
  this.autosaveVars=options.autosave?true:false;
  this.autorun=options.autorun?true:false;
  if(this.autorun) this.interface.classList.add('autorun');
  this.runButton=document.createElement('input');
  this.runButton.setAttribute('type','button');
  this.runButton.value="RUN!";
  this.runButton.classList.add('run-button');
  this.runButton.style.gridColumn=2;
  this.runButton.setAttribute('data-generator',this.index);
  this.runButton.addEventListener('click',function(){
    var gen=Generator.all[parseInt(this.getAttribute('data-generator'))];
    gen.run();
   },false);
  this.resultFile=document.createElement('A');
  this.resultFile.href='#';
  this.resultFile.download='generated.result';
  this.resultFile.appendChild(document.createTextNode("generator.result"))
  this.resultFile.classList.add('disabled');
  this.interface.appendChild(this.runButton);
  this.interface.appendChild(this.resultFile);

  this.variables=[];
  var list =options.variables;
  for(var i=0;i<list.length;i++){
    var v;
      if(list[i].type=='number'){
        v=new NumberVariable(this);
        v.setMinimum(list[i].min);
        v.setMaximum(list[i].max);
        if(list[i].step){
          v.field.setAttribute('step',list[i].step);
        }
        console.log("min",list[i].min);
      }else if(list[i].type=='select'){
        v=new OptionVariable(this,list[i].options);
      }else if(list[i].type=='checkbox'){
        v=new CheckboxVariable(this);
        if(list[i].defaultValue==true){
          v.checkboxElement.setAttribute('checked',true);
        }
      }
      v.setLabel(list[i].label);
      if(list[i].defaultValue) v.setDefaultValue(list[i].defaultValue);
      if(list[i].description) v.setDescription(list[i].description);
  }

  if(query){
    var test=document.querySelector(query);
    if(test){
      this.target=test;
      this.begin();
    }else{
      window.addEventListener('load',function(){
        Generator.all.forEach(function(g){
           g.load();
           g.variables.forEach(function(v){v.load();});
         });
      },false);
    }
  }
};

Generator.all=[];
/*
Generator.prototype.autosaveVariables=function(){
  this.autosaveVars=true;
};

Generator.prototype.autorun=function(){
  this._autorun=true;
  this.interface.classList.add('autorun');
};*/

Generator.prototype.load=function(){
  if(typeof this.target==="string"){
    this.target=document.querySelector(this.target);
    this.begin();
    if(this.autosaveVars){
      var vars=window.localStorage.variables;
      if(vars){
        vars=vars.split('[@]');
        if(vars.length==this.variables.length)
          for(var i=0;i<this.variables.length;i++)
            this.variables[i].loadValueFromString(vars[i]);
      }
    }
  }
  if(this.autorun){
      this.run();
  }
};

Generator.prototype.begin=function(){
  if(this.target)
    this.target.appendChild(this.interface);
};
Generator.prototype.process=function(){};
Generator.isURL=function(str){
  return str.indexOf('http://')==0 || str.indexOf('https://')==0 || str.indexOf('ftp://')==0;
};
Generator.prototype.run=function(){
  var result=null;
  switch (this.variables.length) {
    case 0:result=this.process();break;
    case 1:result=this.process(this.variables[0].getValue());break;
    case 2:result=this.process(this.variables[0].getValue(),this.variables[1].getValue());break;
    case 3:result=this.process(this.variables[0].getValue(),this.variables[1].getValue(),this.variables[2].getValue());break;
    case 4:result=this.process(this.variables[0].getValue(),this.variables[1].getValue(),this.variables[2].getValue(),this.variables[3].getValue());break;
    case 5:result=this.process(this.variables[0].getValue(),this.variables[1].getValue(),this.variables[2].getValue(),this.variables[3].getValue(),this.variables[4].getValue());break;
    case 6:result=this.process(this.variables[0].getValue(),this.variables[1].getValue(),this.variables[2].getValue(),this.variables[3].getValue(),this.variables[4].getValue(),this.variables[5].getValue());break;
    case 7:result=this.process(this.variables[0].getValue(),this.variables[1].getValue(),this.variables[2].getValue(),this.variables[3].getValue(),this.variables[4].getValue(),this.variables[5].getValue(),this.variables[6].getValue());break;
    case 8:result=this.process(this.variables[0].getValue(),this.variables[1].getValue(),this.variables[2].getValue(),this.variables[3].getValue(),this.variables[4].getValue(),this.variables[5].getValue(),this.variables[6].getValue(),this.variables[7].getValue());break;
    default:break;
  }
  if(typeof result==="string"){
    if(Generator.isURL(result)){

    }else{
      if(!this.resultText){
        this.resultText=document.createElement('textarea');
        this.resultText.setAttribute('readonly',true);
        this.interface.appendChild(this.resultText);

      }
    //  var txt=document.createElement('textarea');
      this.resultText.value=result;
      //his.interface.appendChild(txt);
    }
  }
  console.log(result);
};

var generators_valueChanged_timer=0;
function generators_valueChanged(){
  generators_valueChanged_timer=0;
  Generator.all.forEach(function(g){
    if(g.autosaveVars) g.saveVariables();
    if(g.autorun) g.run();
  });

}

Generator.valueChanged=function(){
  if(generators_valueChanged_timer)
    clearTimeout(generators_valueChanged_timer);
  generators_valueChanged_timer=setTimeout(generators_valueChanged,500);
};

Generator.prototype.saveVariables=function(){
  var str="";
  for(var i=0;i<this.variables.length;i++){
    if(i>0) str+="[@]";
    str+=this.variables[i].getValue().toString();
  }
  console.log("v",str);

  if(str.length>0) window.localStorage.variables=str;
};
Generator.prototype.defineVariables=function(list){
  for(var i=0;i<list.length;i++){
    var v;
      if(list[i].type=='number'){
        v=new NumberVariable(this);
        v.setMinimum(list[i].min);
        v.setMaximum(list[i].max);
      }else if(list[i].type=='select'){
        v=new OptionVariable(this,list[i].options);
      }
      v.setLabel(list[i].label);
      if(list[i].defaultValue)
        v.setDefaultValue(list[i].defaultValue);
      if(list[i].description)
        v.setDescription(list[i].description);
  }
};

function Variable(gen){
  this.type=0;
  this.generator=gen;
  this._defaultValue=0;
  this._value=null;
  this.index=Variable.all.length;
  this.generator.variables.push(this);

  Variable.all.push(this);

  this.type=0;
  this.element=document.createElement('DIV');
  this.element.classList.add('variable');
  this.labelElement=document.createElement('LABEL');
  this.labelElement.appendChild(document.createTextNode("Untitled"));
  this.descriptionElement=document.createElement('div');
  this.descriptionElement.classList.add('description');
  this.descriptionElement.appendChild(document.createTextNode("Description"));

  this.generator.interface.removeChild(this.generator.runButton);
  this.generator.interface.removeChild(this.generator.resultFile);

  this.generator.interface.appendChild(this.labelElement);
  this.generator.interface.appendChild(this.element);
  this.generator.interface.appendChild(this.descriptionElement);

  this.generator.interface.appendChild(this.generator.runButton);
  this.generator.interface.appendChild(this.generator.resultFile);


}


Variable.all=[];

Variable.prototype.loadValueFromString=function(str){
  this.setValue(str);
};

Variable.prototype.getDefaultValue=function(){
  return this._defaultValue;
};


Variable.prototype.setDefaultValue=function(val){
  this._defaultValue=val;
};
Variable.prototype.isValidValue=function(val){
  return true;
};
Variable.prototype.getValue=function(){
  if(this._value==null) return this._defaultValue;
  else return this._value;
};
Variable.prototype.setValue=function(val){
  if(this.isValidValue(val)) this._value=val;
};
Variable.prototype.getLabel=function(){
  return this.labelElement.firstChild.nodeValue;
};
Variable.prototype.setLabel=function(val){
  this.labelElement.firstChild.nodeValue=val;
};

Variable.prototype.setLabelTarget=function(el){
  if(!el.id) el.id=JMCreateID();
  this.labelElement.setAttribute('for',el.id);

}
Variable.prototype.getDescription=function(){
  return this._description;
};
Variable.prototype.setDescription=function(val){
  this._description=val;
  this.descriptionElement.firstChild.nodeValue=val;
};
Variable.register=function(func){
  func.prototype = Object.create(Variable.prototype);
  func.prototype.constructor = func;
};
Variable.prototype.load=function(){

};









function NumberVariable(gen){
  Variable.call(this,gen);
  this.type=1;
  var field=document.createElement('input');
  this.field=field;
  field.setAttribute('type','number');
  field.setAttribute('data-variable',this.index);
  this.element.appendChild(field);
  this.setLabelTarget(field);
  this.numberField=field;
  field.addEventListener('change',function(){
    var v=Variable.all[parseInt(this.getAttribute('data-variable'))];
    v.setValue(this.value);
    Generator.valueChanged();
  },false);
}

Variable.register(NumberVariable);

NumberVariable.prototype.load=function(){
  if(this.field.value==null && this._defaultValue!=null) this.numberField.value=this._defaultValue;
};

NumberVariable.prototype.setMaximum=function(v){
  this.numberField.setAttribute('max',v);
};
NumberVariable.prototype.setMinimum=function(v){
  this.numberField.setAttribute('min',v);
};
NumberVariable.prototype.loadValueFromString=function(str){
  this.setValue(parseFloat(str));
};
NumberVariable.prototype.setValue=function(val){
  this.field.value=val;
};
NumberVariable.prototype.getValue=function(){
  return this.field.value;
};







function OptionVariable(gen,options){
  Variable.call(this,gen);
  this.options=options;
  this.selectElement=document.createElement('SELECT');
  this.selectElement.setAttribute('data-variable',this.index);
  this.selectElement.addEventListener('change',function(){
    var v=Variable.all[parseInt(this.getAttribute('data-variable'))];
    v.setValue(this.value);
    Generator.valueChanged();
  },false);

  this.element.appendChild(this.selectElement);
  this.setLabelTarget(this.selectElement);

  for(var i=0;i<options.length;i++){
    var o=document.createElement('OPTION');
    o.value=i;
    o.appendChild(document.createTextNode(options[i]));
    this.selectElement.appendChild(o);
    console.log(options[i]);
  }
}
Variable.register(OptionVariable);


OptionVariable.prototype.loadValueFromString=function(str){
  this.setValue(parseInt(str));
  console.log('load',str);
};
OptionVariable.prototype.setValue=function(val){
  this.selectElement.value=val;
};
OptionVariable.prototype.getValue=function(){
  return this.selectElement.value;
};









function CheckboxVariable(gen){
  Variable.call(this,gen);
  this.checkboxElement=document.createElement('input');
  this.checkboxElement.setAttribute('type',"checkbox");
  this.checkboxElement.setAttribute('data-variable',this.index);
  this.checkboxElement.addEventListener('change',function(){
    var v=Variable.all[parseInt(this.getAttribute('data-variable'))];
    v.setValue(this.checked);
    Generator.valueChanged();
  },false);

  this.element.appendChild(this.checkboxElement);
  this.setLabelTarget(this.checkboxElement);

}
Variable.register(CheckboxVariable);

CheckboxVariable.prototype.setValue=function(val){console.log('val',val);
this.checkboxElement.checked=val;
this.checkboxElement.value=val;
};
CheckboxVariable.prototype.getValue=function(){
  return this.checkboxElement.checked;
};
CheckboxVariable.prototype.loadValueFromString=function(str){
  this.setValue(str=="true");
};
