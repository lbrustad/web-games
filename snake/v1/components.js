class Snake {constructor(){this.sK='snakeByLasseBrustad';this.p=Math.round(b/2);this.f=Math.floor(Math.random()*b);var ls=localStorage.getItem(this.sK)==undefined;this.record=!ls?localStorage.getItem(this.sK):0;}death(){if(this.record<this.tailLength){this.record=this.tailLength;localStorage.setItem(this.sK,this.record);}this.p=Math.round(b/2);this.tail=[0];this.tailLength=0;this.d=[0,0];this.f=Math.floor(Math.random()*b);}feed(){this.tailLength+=1;while(this.f==this.p){this.f=Math.floor(Math.random()*b);}document.getElementById('length').innerHTML=this.tailLength;}move(){var death=false;this.tail.unshift(this.p);while(this.tailLength<this.tail.length){this.tail.pop();}if(this.d[0]!==0){this.p+=this.d[0];if(this.d[0]==-1){if(this.p%g.w==0)death=true;}else{if((this.p-1)%g.w==0)death=true;}}if(this.d[1]!==0){this.p+=this.d[1]*g.w;if(this.p<0||this.p>b)death=true;}if(this.d[0]!==0||this.d[1]!==0){update(death);}cD=[0,0];}}