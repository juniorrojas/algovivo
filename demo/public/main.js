class t{constructor(t,e){this.list=t,this.data=e,this.next=null,this.prev=null}append(e){const s=new t(this.list,e);return this.list.last==this&&(this.list.last=s),s.next=this.next,s.prev=this,null!=this.next&&(this.next.prev=s),this.next=s,this.list.size++,s}prepend(e){const s=new t(this.list,e);return this.list.first==this&&(this.list.first=s),s.next=this,s.prev=this.prev,null!=this.prev&&(this.prev.next=s),this.prev=s,this.list.size++,s}remove(){null!=this.prev&&(this.prev.next=this.next),null!=this.next&&(this.next.prev=this.prev),this.list.first==this&&(this.list.first=this.next),this.list.last==this&&(this.list.last=this.prev),this.list.size--,this.next=null,this.prev=null}}var e=t;const s=e;class r{constructor(t){this.list=t,this.nextNode=this.list.first}next(){if(null==this.nextNode)return{done:!0};{const t={done:!1,value:this.nextNode.data};return this.nextNode=this.nextNode.next,t}}}var n,i,o,h,l,a;function c(){if(i)return n;i=1;const t=u();return n=class extends t{constructor(t={}){super(t)}isFree(){return!1}free(){let t=this.appendFree(this.ptr,this.size);this.remove();const e=t.prev(),s=t.next();return null!=e&&e.isFree()&&(t=e.merge(t)),null!=s&&s.isFree()&&(t=t.merge(s)),t}}}function u(){return h||(h=1,o=class{constructor(t={}){this.manager=t.manager,this.ptr=t.ptr,this.size=t.size,this.node=t.node}numBytes(){return this.size}prev(){const t=this.node.prev;return null!=t?t.data:null}next(){const t=this.node.next;return null!=t?t.data:null}appendReserved(t,e){const s=c(),r=this.node.append(null),n=new s({manager:this.manager,ptr:t,size:e,node:r});return r.data=n,this.manager._addReservedSlot(n),n}appendFree(t,e){const s=d(),r=this.node.append(null),n=new s({manager:this.manager,ptr:t,size:e,node:r});return r.data=n,this.manager._addFreeSlot(n),n}remove(){this.node.remove(),this.node.data=null,this.node=null,this.isFree()?this.manager._removeFreeSlot(this):this.manager._removeReservedSlot(this)}toTypedArray(t){const e=this.size,s=t.BYTES_PER_ELEMENT;if(e%s!=0)throw new Error(`size in bytes must be a multiple of ${s}, found ${e}`);const r=this.ptr;return new t(this.manager.array,r,e/s)}f32(){return this.toTypedArray(Float32Array)}u32(){return this.toTypedArray(Uint32Array)}}),o}function d(){if(a)return l;a=1;const t=u();return l=class extends t{constructor(t={}){super(t)}isFree(){return!0}reserve(t){const e=this.numBytes();if(t>e)throw new Error(`cannot reserve ${t} bytes, only ${e} bytes are available`);const s=this.appendReserved(this.ptr,t);return s.appendFree(this.ptr+t,e-t),this.remove(),s}merge(t){if(!this.isFree()||!t.isFree())throw new Error("only free slots can be merged");if(this.next()!=t)throw new Error("only adjacent slots can be merged");const e=t.appendFree(this.ptr,this.size+t.size);return this.remove(),t.remove(),e}}}const m=class{constructor(){this.first=null,this.last=null,this.size=0}isEmpty(){if(null==this.first&&null!=this.last||null!=this.first&&null==this.last)throw Error("inconsistent first last state");return null==this.first}append(t){return this.isEmpty()?this.setSingleton(t):this.last.append(t)}prepend(t){return this.isEmpty()?this.setSingleton(t):this.first.prepend(t)}setSingleton(t){const e=new s(this,t);return this.first=e,this.last=e,this.size=1,e}iter(){return new r(this)}},p=d();var f={MemoryManager:class{constructor(t,e){this.array=t,null==e&&(e=0),this.slots=new m,this.freeSlots=new m,this.reservedSlots=new m;const s=new p({manager:this,ptr:e,size:t.byteLength-e}),r=this.slots.append();r.data=s,s.node=r;const n=this.freeSlots.append();n.data=s,s.freeNode=n}numReservedSlots(){return this.reservedSlots.size}numFreeSlots(){return this.freeSlots.size}numFreeBytes(){let t=0;const e=this.freeSlots.iter();let s=e.next();for(;!s.done;)t+=s.value.size,s=e.next();return t}numReservedBytes(){let t=0;const e=this.reservedSlots.iter();let s=e.next();for(;!s.done;)t+=s.value.size,s=e.next();return t}mallocBytes(t){return this._malloc(t)}malloc32(t){return this.mallocBytes(4*t)}_addReservedSlot(t){const e=this.reservedSlots.append(t);t.reservedNode=e}_removeReservedSlot(t){if(null==t.reservedNode)throw new Error("reservedNode cannot be null");t.reservedNode.remove()}_addFreeSlot(t){const e=this.freeSlots.append(t);t.freeNode=e}_removeFreeSlot(t){if(null==t.freeNode)throw new Error("freeNode cannot be null");t.freeNode.remove()}_malloc(t){if(!Number.isInteger(t))throw new Error(`expected integer, found ${t}`);let e=null;const s=this.freeSlots.iter();let r=s.next();for(;!r.done;){const n=r.value;if(n.size>=t){e=n;break}r=s.next()}if(null==e)throw new Error("no valid free slot available");return e.reserve(t)}},FreeSlot:d(),ReservedSlot:c()};class g{constructor(t={}){const e=t.engine;if(null==e)throw new Error("engine required to create IntTuple");this.engine=e;const s=t.slot;if(null==s)throw new Error("slot required to create IntTuple");this.slot=s,this.ptr=s.ptr,this.length=t.length}forEach(t){for(let e=0;e<this.length;e++)t(this.get(e),e)}equal(t){if(t instanceof g){for(let e=0;e<this.length;e++)if(this.get(e)!=t.get(e))return!1;return!0}if(Array.isArray(t)){for(let e=0;e<this.length;e++)if(this.get(e)!=t[e])return!1;return!0}return!1}toString(){return this.slot.u32().toString()}toArray(){const t=[];return this.forEach((e=>{t.push(e)})),t}typedArray(){return this.slot.u32()}set(t,e){this.typedArray()[t]=e}get(t){return this.typedArray()[t]}dispose(){this.slot.free()}}var w=g;function y(t,e,s,r){if(e==s.length-1)for(let n=0;n<s[e];n++)t.push(r);else for(let n=0;n<s[e];n++){const n=[];t.push(n),y(n,e+1,s,r)}}var x={inferShape:function(t){const e=[];let s=t;for(;Array.isArray(s);)e.push(s.length),s=s[0];return e},makeNdArray:function(t,e){let s=t;t instanceof w&&(s=t.toArray());const r=[];return y(r,0,s,e),r},numelOfShape:function(t){let e=1;return t.forEach((t=>{e*=t})),e},getArrElem:function t(e,s){if(!Array.isArray(s))throw new Error(`expected array, found ${typeof s}: ${s}`);return 0==s.length?e:t(e[s[0]],s.slice(1))},setArrElem:function t(e,s,r){if(!Array.isArray(s))throw new Error(`expected array, found ${typeof s}: ${s}`);if(1!=s.length)return t(e[s[0]],s.slice(1),r);e[s]=r}};const v=w;class b{constructor(t){if(null==t)throw new Error("shape required");if(!(t instanceof v))throw new Error(`IntTuple shape expected, found ${typeof t}: shape`);this.shape=t,this.done=!1,this.idx=[],t.forEach((t=>{this.idx.push(0)}))}next(){const t=this.shape;for(let e=0;e<t.length;e++){const s=t.length-1-e;if(this.idx[s]<t.get(s)-1)return void this.idx[s]++;if(0==s)return void(this.done=!0);this.idx[s]=0}}static shapeForEach(t,e){const s=new b(t);for(;!s.done;)e(s.idx),s.next()}}const S=x,E=b,C=w;class A{constructor(t={}){const e=t.engine;if(null==e)throw new Error("engine required to create tensor");this.engine=e;const s=t.shape;if(null==s)throw new Error("shape required to create tensor");if(s instanceof C)this.shape=s;else{if(!Array.isArray(s))throw new Error(`invalid shape type ${typeof s}: ${s}`);this.shape=e.intTuple(s)}this.order=this.shape.length;const r=S.numelOfShape(this.shape);this.numel=r;const n=t.slot;if(r>0&&null==n)throw new Error("memory slot required to create tensor");this.slot=t.slot,this.ptr=this.slot.ptr;const i=t.stride;if(null!=i){if(!(i instanceof C))throw new Error(`expected IntTuple stride, found ${typeof i}: ${i}`);this.stride=i}else this.setDefaultStride()}isScalar(){return 0==this.order}flattenIdx(t){let e,s,r=!1;if(Array.isArray(t)&&(e=this.engine.intTuple(t),r=!0),!(e instanceof C))throw new Error(`cannot handle ${typeof e}: ${e}`);return s=this.engine.wasmInstance.exports.flatten_idx(this.order,e.slot.ptr,this.stride.slot.ptr),r&&e.dispose(),s}typedArray(){return this.slot.f32()}toArray(){const t=S.makeNdArray(this.shape,0);return this.forEach((e=>{const s=this.get(e);S.setArrElem(t,e,s)})),t}get(t){const e=this.flattenIdx(t);return this.typedArray()[e]}item(){if(!this.isScalar())throw new Error(`item() only works for scalars, found tensor with shape ${this.shape}`);return this.get([0])}setDefaultStride(){let t=1;const e=this.order,s=[];for(let t=0;t<e;t++)s.push(0);for(let r=0;r<e;r++){const n=e-1-r;s[n]=t,t*=this.shape.get(n)}this.stride=this.engine.intTuple(s)}setFromArray(t){if(this.isScalar()){if("number"!=typeof t)throw new Error(`expected number, found ${typeof t}: ${t}`);this.set([0],t)}else{if(!Array.isArray(t))throw new Error(`expected array, found ${typeof t}: ${t}`);const e=S.inferShape(t);if(!this.shape.equal(e))throw new Error(`inconsistent shapes ${e} != ${this.shape}`);this.forEach((e=>{const s=S.getArrElem(t,e);this.set(e,s)}))}}set(t,e){if(null==e&&Array.isArray(t))this.setFromArray(t);else{const s=this.flattenIdx(t);this.typedArray()[s]=e}}forEach(t){E.shapeForEach(this.shape,t)}squeeze(t){-1==t&&(t=this.shape.length-1);const e=this.shape.get(t);if(1!=e)throw new Error(`cannot squeeze a dimension that is not equal to 1, shape[${t}] = ${e}`);const s=[];for(let e=0;e<this.order;e++)t!=e&&s.push(this.shape.get(e));return new A({engine:this.engine,shape:s,slot:this.slot})}unsqueeze(t){-1==t&&(t=this.shape.length-1);const e=[];for(let s=0;s<this.order;s++)e.push(this.shape.get(s)),t==s&&e.push(1);return new A({engine:this.engine,shape:e,slot:this.slot})}pow2(t){return this.engine.wasmInstance.exports.pow2(this.numel,this.slot.ptr,t.slot.ptr)}add(t,e){this.engine.functional.add(this,t,e)}sum(t){this.engine.wasmInstance.exports.sum(this.numel,this.slot.ptr,t.slot.ptr)}dispose(){this.slot.free(),this.shape.dispose(),this.stride.dispose()}}var T=A,z=class{constructor(){}};const _=z;const I=z;const k=z;const L=z;const P=class extends _{constructor(t,e){super(),this.nn=t,this.layers=e}forward(t){let e=t;return this.layers.forEach((t=>{e=t.forward(e)})),e}},M=class extends I{constructor(t,e,s){super(),this.nn=t,this.inputSize=e,this.outputSize=s;const r=this.nn.engine;this.weight=r.zeros([s,e]),this.bias=r.zeros([s]),this.output=r.zeros([s])}forward(t){const e=this.nn.engine.functional;return e.matvec(this.weight,t,this.output),e.add(this.output,this.bias,this.output),this.output}dispose(){this.weight.dispose(),this.bias.dispose(),this.output.dispose()}},$=class extends k{constructor(t){super(),this.nn=t,this.output=null}forward(t){const e=this.nn.engine;return null==this.output&&(this.output=e.zerosLike(t)),e.functional.relu(t,this.output),this.output}},D=class extends L{constructor(t){super(),this.nn=t,this.output=null}forward(t){const e=this.nn.engine;return null==this.output&&(this.output=e.zerosLike(t)),e.functional.tanh(t,this.output),this.output}},V=f,W=x,q=T,F=w,B=class{constructor(t={}){const e=this.engine=t.engine;this.wasmInstance=e.wasmInstance}matvec(t,e,s){const r=t.shape.get(0),n=t.shape.get(1),i=e.shape.get(0),o=s.shape.get(0);if(r!=o)throw new Error(`inconsistent output size ${r} != ${o}`);if(n!=i)throw new Error(`inconsistent input size ${n} != ${i}`);this.wasmInstance.exports.matvec(r,n,t.stride.ptr,t.ptr,e.stride.ptr,e.ptr,s.stride.ptr,s.ptr)}mm(t,e,s){const r=t.shape.get(0),n=t.shape.get(1),i=e.shape.get(1);this.wasmInstance.exports.mm(r,n,i,t.stride.ptr,t.ptr,e.stride.ptr,e.ptr,s.stride.ptr,s.ptr)}relu(t,e){this.wasmInstance.exports.relu(t.numel,t.ptr,e.ptr)}tanh(t,e){const s=t.numel,r=t.typedArray(),n=e.typedArray();for(let t=0;t<s;t++)n[t]=Math.tanh(r[t])}add(t,e,s){this.wasmInstance.exports.add(t.numel,t.ptr,e.ptr,s.ptr)}sum(t,e){this.wasmInstance.exports.sum(t.numel,t.ptr,e.ptr)}sumBackward(t,e,s,r){this.wasmInstance.exports.sum_backward(t.numel,t.ptr,e.ptr,s.ptr,r.ptr)}},R=class{constructor(t={}){if(null==t.wasmInstance)throw new Error("wasmInstance required");this.wasmInstance=t.wasmInstance;const e=t.wasmInstance.exports.memory.buffer,s=new V.MemoryManager(e,t.wasmInstance.exports.__heap_base);this.mgr=s,this.functional=this.F=new B({engine:this}),this.nn=new class{constructor(t={}){this.engine=t.engine}Linear(t,e){return new M(this,t,e)}ReLU(){return new $(this)}Tanh(){return new D(this)}Sequential(){const t=Array.from(arguments);return new P(this,t)}}({engine:this}),this._mergeF()}_mergeF(){Object.getOwnPropertyNames(Object.getPrototypeOf(this.F)).forEach((t=>{"constructor"!=t&&(this[t]=this.F[t])}))}tensor(t){const e=W.inferShape(t),s=this.intTuple(e),r=W.numelOfShape(e),n=this.mgr.malloc32(r),i=new q({engine:this,shape:s,slot:n});return i.setFromArray(t),i}intTuple(t){if(!Array.isArray(t))throw new Error(`expected array, found ${typeof t}: ${t}`);const e=t.length,s=this.mgr.malloc32(e),r=new F({engine:this,length:e,slot:s});for(let s=0;s<e;s++)r.set(s,t[s]);return r}zerosLike(t){if(!(t instanceof q))throw new Error(`expected tensor, found ${typeof t}: ${t}`);return this.zeros(t.shape)}zeros(t){let e;if(t instanceof F)e=t;else{if(!Array.isArray(t))throw new Error(`expected array, found ${typeof t}: ${t}`);e=this.intTuple(t)}const s=W.numelOfShape(e),r=this.mgr.malloc32(s),n=new q({engine:this,shape:e,slot:r});return this.wasmInstance.exports.zero_(s,r.ptr),n}};var N={engine:function(t={}){return new R({wasmInstance:t.wasmInstance})},Engine:R,Tensor:T,mmgr:f,utils:x};const j=N;function X(t){return[t[0],t[1]]}function U(t,e){t[0]*=e,t[1]*=e}function G(t,e){const s=X(t);return U(s,e),s}function O(t){return t[0]*t[0]+t[1]*t[1]}function H(t){return Math.sqrt(O(t))}var J={clone:X,add:function(t,e){return[t[0]+e[0],t[1]+e[1]]},add_:function(t,e){t[0]+=e[0],t[1]+=e[1]},mulScalar_:U,mulScalar:G,sub:function(t,e){return[t[0]-e[0],t[1]-e[1]]},quadrance:O,norm:H,normalize:function(t){return G(t,1/H(t))},dot:function(t,e){return t[0]*e[0]+t[1]*e[1]}};class Y{constructor(t,e,s,r){this.m00=t,this.m01=e,this.m10=s,this.m11=r}get(t,e){return this[`m${t}${e}`]}set(t,e,s,r){this.m00=t,this.m01=e,this.m10=s,this.m11=r}toArray(){return[[this.m00,this.m01],[this.m10,this.m11]]}negate(){return new Y(-this.m00,-this.m01,-this.m10,-this.m11)}apply(t){return[this.m00*t[0]+this.m01*t[1],this.m10*t[0]+this.m11*t[1]]}det(){return this.m00*this.m11-this.m10*this.m01}inv(){const t=this.det();return new Y(this.m11/t,-this.m01/t,-this.m10/t,this.m00/t)}mm(t){const e=this.m00,s=this.m01,r=this.m10,n=this.m11,i=t.m00,o=t.m01,h=t.m10,l=t.m11;return new Y(e*i+s*h,e*o+s*l,r*i+n*h,r*o+n*l)}t(){return new Y(this.m00,this.m10,this.m01,this.m11)}static fromArray(t){return new Y(t[0][0],t[0][1],t[1][0],t[1][1])}}var Z=Y;const K=Z,Q=J;class tt{constructor(){this.translation=[0,0],this.linear=new K(1,0,0,1)}inferScale(){return this.linear.m00}apply(t){return Q.add(this.linear.apply(t),this.translation)}inv(){const t=new tt;return t.linear=this.linear.inv(),t.translation=t.linear.negate().apply(this.translation),t}toColumnMajorArray(){return[this.linear.get(0,0),this.linear.get(1,0),this.linear.get(0,1),this.linear.get(1,1),this.translation[0],this.translation[1]]}}var et={Vec2:J,Matrix2x2:Z,Transform2d:tt,AABB:class{constructor(t={}){if(null==t.x0)throw new Error("x0 required");if(null==t.y0)throw new Error("y0 required");this._x0=t.x0,this._y0=t.y0;let e=null;if(null!=t.width)e=this._x0+t.width;else{if(null==t.x1)throw new Error("x1 required");e=t.x1}this._x1=e;let s=null;if(null!=t.height)s=this._y0+t.height;else{if(null==t.y1)throw new Error("y1 required");s=t.y1}this._y1=s}x0(){return this._x0}x1(){return this._x1}y0(){return this._y0}y1(){return this._y1}center(){return[.5*(this.x0+this.x1),.5*(this.y0+this.y1)]}}},st={computeDomCursor:function(t,e){const s=e.getBoundingClientRect();let r,n;if(null==t.touches)r=t.clientX,n=t.clientY;else{if(0==t.touches.length)return null;const e=t.touches[0];r=e.clientX,n=e.clientY}return[r-s.left,n-s.top]}};const rt=st;var nt={cursorUtils:st,DragBehavior:class{constructor(t={}){this._dragging=!1,this.onDomCursorDown=t.onDomCursorDown,this.onDragProgress=t.onDragProgress,this.onDomCursorUp=t.onDomCursorUp,this.domElement=null}beginDrag(){this._dragging=!0}endDrag(){this._dragging=!1}dragging(){return this._dragging}domCursorDown(t,e){null!=this.onDomCursorDown&&this.onDomCursorDown(t,e)}domCursorMove(t,e){this.dragging()&&null!=this.onDragProgress&&this.onDragProgress(t,e)}domCursorUp(t,e){this.endDrag(),null!=this.onDomCursorUp&&this.onDomCursorUp(t,e)}linkToDom(t){if(null!=this.domElement)throw new Error("already linked to DOM");this.domElement=t;const e=e=>{e.preventDefault();const s=rt.computeDomCursor(e,t);this.domCursorDown(s,e)};t.addEventListener("mousedown",e,{passive:!1}),t.addEventListener("touchstart",e,{passive:!1});const s=e=>{const s=rt.computeDomCursor(e,t);this.domCursorMove(s,e)};t.addEventListener("mousemove",s,{passive:!1}),t.addEventListener("touchmove",s,{passive:!1});const r=e=>{const s=rt.computeDomCursor(e,t);this.domCursorUp(s,e)};window.addEventListener("mouseup",r),window.addEventListener("touchend",r),window.addEventListener("touchcancel",r)}}},it={PointShader:class{constructor(){}renderPoint(t={}){const e=t.ctx,s=t.p;e.beginPath(),e.arc(s[0],s[1],3,0,2*Math.PI),e.fill()}},LineShader:class{constructor(){}renderLine(t={}){const e=t.ctx,s=t.a,r=t.b;e.beginPath(),e.strokeStyle="red",e.lineWidth=5,e.moveTo(s[0],s[1]),e.lineTo(r[0],r[1]),e.closePath(),e.stroke()}},TriangleShader:class{constructor(){}renderTriangle(t={}){const e=t.ctx,s=t.a,r=t.b,n=t.c;e.save(),e.beginPath(),e.strokeStyle="black",e.moveTo(s[0],s[1]),e.lineTo(r[0],r[1]),e.lineTo(n[0],n[1]),e.closePath(),e.stroke(),e.restore()}}};const ot=et;const ht=et,lt=it;var at=class{constructor(t={}){this.scene=t.scene,this.id=t.id,this.x=[],this.triangles=[],this.lines=[],this.pointShader=new lt.PointShader({}),this.lineShader=new lt.LineShader({}),this.triangleShader=new lt.TriangleShader({}),this.customAttributes={}}numVertices(){return this.x.length}numTriangles(){return this.triangles.length}numLines(){return this.lines.length}setCustomAttribute(t,e){this.customAttributes[t]=e}getCustomAttribute(t){return this.customAttributes[t]}computeAABB(){let t=null,e=null,s=null,r=null;return this.x.forEach((n=>{const i=n[0],o=n[1];(null==t||i<t)&&(t=i),(null==e||i>e)&&(e=i),(null==s||o<s)&&(s=o),(null==r||o>r)&&(r=o)})),new ht.AABB({x0:t,y0:s,x1:e,y1:r})}computeCenter(){let t=[0,0];const e=this.x.length;for(let s=0;s<e;s++){const e=this.x[s];ht.Vec2.add_(t,e)}return ht.Vec2.mulScalar_(t,1/e),t}};const ct=at;const ut=at;var dt={Camera:class{constructor(){this.transform=new ot.Transform2d}domToWorldSpace(t){if(!Array.isArray(t))throw new Error("array expected, found "+typeof t);if(2!=t.length)throw new Error(`array with 2 elements expected, found ${t.length}`);return this.transform.inv().apply(t)}inferScale(){return this.transform.inferScale()}center(t){let e,s=t.zoom?t.zoom:1,r=t.viewportWidth,n=t.viewportHeight;if(null!=t.renderer&&(r=t.renderer.width,n=t.renderer.height),null!=t.worldWidth){if(null==r)throw new Error("viewportWidth required");s=r/t.worldWidth}if(this.transform.linear=new ot.Matrix2x2(s,0,0,-s),null!=t.worldCenter){const i=t.worldCenter;e=[.5*r-i[0]*s,.5*n+i[1]*s]}else e=[.5*r,.5*n];this.transform.translation=e}},Mesh:at,Renderer:class{constructor(){const t=document.createElement("canvas");this.domElement=t,this.ctx=t.getContext("2d"),this.setSize({width:200,height:200})}setSize(t){const e=t.width;if(null==e)throw new Error("width required to setSize");const s=t.height;if(null==s)throw new Error("height required to setSize");let r=t.viewportWidth;null==r&&(r=e);let n=t.viewportHeight;null==n&&(n=s),this.width=e,this.height=s,this.viewportWidth=r,this.viewportHeight=n;const i=this.domElement;i.width=r,i.height=n,i.style.width=`${e}px`,i.style.height=`${s}px`}renderPoint(t,e,s,r,n){const i=this.ctx;let o;if(!(e instanceof ct))throw new Error("invalid mesh");o=e.x[r];const h=s.transform.apply(o);i.save(),e.pointShader.renderPoint({ctx:i,renderer:t,mesh:e,camera:s,id:r,p:h,custom:n}),i.restore()}renderLine(t,e,s,r,n){const i=this.ctx,o=e.lines[r],h=s.transform.apply(e.x[o[0]]),l=s.transform.apply(e.x[o[1]]);i.save(),e.lineShader.renderLine({ctx:i,renderer:t,mesh:e,camera:s,id:r,a:h,b:l,custom:n}),i.restore()}renderTriangle(t,e,s,r,n){const i=this.ctx,o=e.triangles[r],h=o[0],l=o[1],a=o[2];let c,u,d;if(e.x instanceof Float32Array){const t=2;c=[e.x[h*t],e.x[h*t+1]],u=[e.x[l*t],e.x[l*t+1]],d=[e.x[a*t],e.x[a*t+1]]}else c=e.x[h],u=e.x[l],d=e.x[a];const m=s.transform.apply(c),p=s.transform.apply(u),f=s.transform.apply(d);i.save(),e.triangleShader.renderTriangle({ctx:i,renderer:t,mesh:e,camera:s,id:r,a:m,b:p,c:f,custom:n}),i.restore()}renderMesh(t,e,s,r={}){for(let n=0;n<e.triangles.length;n++)this.renderTriangle(t,e,s,n,r);for(let n=0;n<e.lines.length;n++)this.renderLine(t,e,s,n,r);for(let n=0;n<e.x.length;n++)this.renderPoint(t,e,s,n,r)}render(t,e,s={}){this.ctx.clearRect(0,0,this.viewportWidth,this.viewportHeight),t.meshes.forEach((t=>{this.renderMesh(this,t,e,s)}))}},Scene:class{constructor(){this.meshes=new Map}clean(){this.meshes=new Map}numMeshes(){return this.meshes.size}addMesh(){const t=this.meshes.size,e=new ut({scene:this,id:t});return this.meshes.set(t,e),e}}};class mt{constructor(t={}){if(null==t.scene)throw new Error("scene required");const e=this.scene=t.scene,s=this.mesh=e.addMesh();s.x=[[-10,0],[10,0]],s.lines=[[0,1]],s.lineShader.renderLine=mt.makeFloorLineShader({width:t.width}),s.setCustomAttribute("translation",[0,0])}static makeFloorLineShader(t={}){const e=null==t.width?.055:t.width;return t=>{const s=t.ctx,r=t.a,n=t.b,i=t.camera,o=t.mesh,h=i.inferScale(),l=o.getCustomAttribute("translation"),a=[h*l[0],h*l[1]];s.strokeStyle="black",s.lineWidth=h*e,s.beginPath(),s.moveTo(r[0]+a[0],r[1]+a[1]),s.lineTo(n[0]+a[0],n[1]+a[1]),s.stroke()}}}var pt={makePointShader:function(t={}){const e=null==t.radius?.028:t.radius,s=null==t.borderColor?"black":t.borderColor,r=null==t.fillColor?"white":t.fillColor,n=null==t.borderWidth?.023:t.borderWidth;return t=>{const i=t.ctx,o=t.p,h=t.camera.inferScale(),l=(e+n)*h;i.fillStyle=s,i.beginPath(),i.arc(o[0],o[1],l,0,2*Math.PI),i.fill();const a=e*h;i.fillStyle=r,i.beginPath(),i.arc(o[0],o[1],a,0,2*Math.PI),i.fill()}},makeFiberShader:function(t={}){const e=null==t.color0?[255,0,0]:t.color0,s=null==t.color1?[250,190,190]:t.color1,r=null==t.width?.065:t.width,n=null==t.borderWidth?.017:t.borderWidth,i=null==t.borderColor?"black":t.borderColor,o=null==t.lineCap?"butt":t.lineCap,h=null==t.muscleIntensityAttributeName?"muscleIntensity":t.muscleIntensityAttributeName;return t=>{const l=t.ctx,a=t.a,c=t.b,u=t.mesh,d=t.camera.inferScale();l.beginPath(),l.lineCap=o,l.strokeStyle=i,l.lineWidth=(r+2*n)*d,l.moveTo(a[0],a[1]),l.lineTo(c[0],c[1]),l.stroke(),l.beginPath();const m=u.getCustomAttribute(h);if(null==m)throw new Error(`muscle intensity attribute (${h}) not found, call setCustomAttribute("${h}", value) before rendering.`);if(!Array.isArray(m))throw new Error("muscle intensity attribute must be an array with values for each fiber, found "+typeof m);const p=u.lines.length;if(m.length!=p)throw new Error(`expected ${p} values in muscle intensity attribute, found ${m.length}`);const f=m[t.id],g=(1-f)*e[0]+f*s[0],w=(1-f)*e[1]+f*s[1],y=(1-f)*e[2]+f*s[2];l.strokeStyle=`rgb(${g}, ${w}, ${y})`,l.lineCap=o,l.lineWidth=r*d,l.moveTo(a[0],a[1]),l.lineTo(c[0],c[1]),l.stroke()}},makeTriangleShader:function(t={}){const e=null==t.borderWidth?.029:t.borderWidth,s=null==t.borderColor?"black":t.borderColor,r=null==t.fillColor?"white":t.fillColor;return t=>{const n=t.ctx,i=t.a,o=t.b,h=t.c,l=t.camera.inferScale();n.beginPath(),n.lineJoin="round",n.lineCap="round",n.strokeStyle=s,n.lineWidth=2*e*l,n.moveTo(i[0],i[1]),n.lineTo(o[0],o[1]),n.lineTo(h[0],h[1]),n.closePath(),n.stroke(),n.beginPath(),n.lineJoin="round",n.lineCap="round",n.fillStyle=r,n.moveTo(i[0],i[1]),n.lineTo(o[0],o[1]),n.lineTo(h[0],h[1]),n.closePath(),n.fill()}},makeFloorShader:function(t={}){return t=>{const e=t.ctx,s=t.a,r=t.b,n=t.camera.inferScale();e.beginPath(),e.strokeStyle="black",e.lineCap="round",e.lineWidth=.055*n,e.moveTo(s[0],s[1]),e.lineTo(r[0],r[1]),e.closePath(),e.stroke()}},Floor:mt};class ft{constructor(t={}){if(null==t.scene)throw new Error("scene required");const e=null==t.color?"rgba(0, 0, 0, 0.30)":t.color,s=null==t.cellSize?1:t.cellSize,r=null==t.innerCells?3:t.innerCells,n=null==t.rows?3:t.rows,i=null==t.cols?4:t.cols,o=null==t.x0?-2:t.x0,h=null==t.y0?0:t.y0,l=null==t.primaryLineWidth?.03:t.primaryLineWidth,a=null==t.secondaryLineWidth?.008:t.secondaryLineWidth,c=this.mesh=t.scene.addMesh(),u=function(t={}){const e=null==t.cellSize?1:t.cellSize,s=null==t.innerCells?3:t.innerCells,r=null==t.rows?3:t.rows,n=null==t.cols?4:t.cols,i=null==t.x0?-2:t.x0,o=null==t.y0?0:t.y0,h=null==t.primaryLineWidth?.022:t.primaryLineWidth,l=null==t.secondaryLineWidth?.008:t.secondaryLineWidth,a=[],c=[],u=[],d=o+r*e,m=i+n*e;function p(t,e){for(let r=0;r<t+1;r++){const n=r==t?1:s;for(let t=0;t<n;t++){const s=2*c.length;e(r,t,n,a),c.push([s,s+1]),0==t?u.push(h):u.push(l)}}}return p(r,((t,s,r,n)=>{const h=s/r,l=(o+t*e)*(1-h)+(o+(t+1)*e)*h;n.push([i,l]),n.push([m,l])})),p(n,((t,s,r,n)=>{const h=s/r,l=(i+t*e)*(1-h)+(i+(t+1)*e)*h;n.push([l,o]),n.push([l,d])})),[a,c,u]}({cellSize:s,innerCells:r,rows:n,cols:i,x0:o,y0:h,primaryLineWidth:l,secondaryLineWidth:a});c.x=u[0],c.lines=u[1],c.setCustomAttribute("lineWidths",u[2]),c.setCustomAttribute("translation",[0,0]),c.pointShader.renderPoint=()=>{},c.lineShader.renderLine=ft.makeGridLineShader({color:e})}static makeGridLineShader(t={}){const e=null==t.color?"black":t.color;return t=>{const s=t.ctx,r=t.a,n=t.b,i=t.camera,o=t.mesh,h=i.inferScale();s.beginPath(),s.strokeStyle=e;const l=o.getCustomAttribute("lineWidths");if(null==l)throw new Error("custom attribute lineWidths missing");const a=l[t.id],c=o.getCustomAttribute("translation"),u=[h*c[0],h*c[1]];s.lineWidth=a*h,s.moveTo(r[0]+u[0],r[1]+u[1]),s.lineTo(n[0]+u[0],n[1]+u[1]),s.closePath(),s.stroke()}}}var gt={math:et,ui:nt,shaders:it,core:dt,custom:pt,background:{Grid:ft,Background:class{constructor(t={}){if(null==t.scene)throw new Error("scene required");const e=this.mesh=t.scene.addMesh();e.x=[[0,0]];const s=null==t.color1?"#fcfcfc":t.color1,r=null==t.color2?"#d7d8d8":t.color2;e.pointShader.renderPoint=(t={})=>{const e=t.renderer.width,n=t.renderer.height,i=t.ctx,o=i.createRadialGradient(.5*e,.5*n,.05*e,.5*e,.5*n,.5*e);o.addColorStop(0,s),o.addColorStop(1,r),i.fillStyle=o,i.fillRect(0,0,e,n)}}}}};const wt=gt;var yt=function(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}({System:class{constructor(t={}){if(null==t.wasmInstance)throw new Error("wasmInstance required");const e=new j.Engine({wasmInstance:t.wasmInstance});this.ten=e;const s=e.wasmInstance,r=e.mgr;this.wasmInstance=s,this.memoryManager=r,this.fixedVertexId=-1,this.h=.033,this.spaceDim=2}numVertices(){return null==this.x0?0:this.x0.shape.get(0)}numTriangles(){return null==this.triangles?0:this.triangles.u32().length/3}numSprings(){return null==this.springs?0:this.springs.u32().length/2}setX(t){const e=this.ten,s=this.spaceDim,r=t.length,n=e.tensor(t);null!=this.x0&&this.x0.dispose(),this.x0=n;const i=e.zeros([r,s]);null!=this.x1&&this.x1.dispose(),this.x1=i;const o=e.zeros([r,s]);null!=this.v0&&this.v0.dispose(),this.v0=o;const h=e.zeros([r,s]);null!=this.v1&&this.v1.dispose(),this.v1=h,this.updateTmpBuffers()}setSprings(t={}){if(null==t.indices)throw new Error("indices required");const e=t.indices,s=e.length,r=this.memoryManager,n=this.ten,i=r.malloc32(2*s);null!=this.springs&&this.springs.free(),this.springs=i;const o=i.u32();e.forEach(((t,e)=>{o[2*e]=t[0],o[2*e+1]=t[1]}));const h=n.zeros([s]);null!=this.l0&&this.l0.dispose(),this.l0=h,null==t.l0?this.wasmInstance.exports.l0_of_x(this.numVertices(),this.x0.ptr,s,this.springs.ptr,this.l0.ptr):this.l0.set(t.l0);const l=n.zeros([s]);null!=this.a&&this.a.dispose(),this.a=l;const a=l.slot.f32();for(let t=0;t<s;t++)a[t]=1}setTriangles(t={}){if(null==t.indices)throw new Error("indices required");const e=t.indices,s=e.length,r=this.memoryManager,n=this.ten,i=r.malloc32(3*s);null!=this.triangles&&this.triangles.free(),this.triangles=i;const o=i.u32();e.forEach(((t,e)=>{o[3*e]=t[0],o[3*e+1]=t[1],o[3*e+2]=t[2]}));const h=n.zeros([s,2,2]);null!=this.rsi&&this.rsi.dispose(),this.rsi=h,null==t.rsi?this.wasmInstance.exports.rsi_of_x(this.numVertices(),this.x0.ptr,s,this.triangles.ptr,this.rsi.ptr):this.rsi.set(t.rsi)}set(t){this.setX(t.x),this.r=null,this.setSprings({indices:t.springs??[],l0:t.springsL0}),this.setTriangles({indices:t.triangles??[],rsi:t.trianglesRsi})}updateTmpBuffers(){if(null==this.x0)throw new Error("x0 required");const t=this.numVertices(),e=this.ten,s=e.zeros([t,2]);null!=this.xGrad&&this.xGrad.dispose(),this.xGrad=s;const r=e.zeros([t,2]);null!=this.xTmp&&this.xTmp.dispose(),this.xTmp=r}step(){const t=this.numVertices(),e=this.numSprings(),s=this.numTriangles(),r=this.fixedVertexId;this.wasmInstance.exports.backward_euler_update(t,this.x1.ptr,this.xGrad.ptr,this.xTmp.ptr,this.x0.ptr,this.v0.ptr,this.v1.ptr,this.h,0,e,0==e?0:this.springs.ptr,s,0==s?0:this.triangles.ptr,0==s?0:this.rsi.ptr,0==e?0:this.a.ptr,0==e?0:this.l0.ptr,r),this.x0.slot.f32().set(this.x1.slot.f32()),this.v0.slot.f32().set(this.v1.slot.f32())}dispose(){null!=this.x0&&this.x0.dispose(),null!=this.x1&&this.x1.dispose(),null!=this.xGrad&&this.xGrad.dispose(),null!=this.xTmp&&this.xTmp.dispose(),null!=this.v0&&this.v0.dispose(),null!=this.v1&&this.v1.dispose(),null!=this.triangles&&this.triangles.free(),null!=this.rsi&&this.rsi.dispose(),null!=this.springs&&this.springs.free(),null!=this.l0&&this.l0.dispose(),null!=this.a&&this.a.dispose()}},mmgrten:N,SystemViewport:class{constructor(t={}){if(null==t.system)throw new Error("system required");this.system=t.system;const e=new wt.core.Renderer;this.renderer=e,this.domElement=e.domElement,this.setSize({width:400,height:400});const s=new wt.core.Scene;this.scene=s;const r=new wt.core.Camera;this.camera=r,new wt.background.Background({scene:s}),this.grid=new wt.background.Grid({scene:s,x0:-3,y0:0,rows:4,cols:10,innerCells:2,primaryLineWidth:.022,secondaryLineWidth:.005,color:"#acadad"}),this.floor=new wt.custom.Floor({scene:s});const n=s.addMesh();this.mesh=n;const i=s.addMesh();this.muscleMesh=i,n.pointShader.renderPoint=wt.custom.makePointShader(),n.triangleShader.renderTriangle=(t={})=>{const e=t.ctx,s=t.a,r=t.b,n=t.c;t.camera.inferScale(),e.beginPath(),e.fillStyle="white",e.moveTo(s[0],s[1]),e.lineTo(r[0],r[1]),e.lineTo(n[0],n[1]),e.closePath(),e.fill()},n.lineShader.renderLine=(t={})=>{const e=t.ctx,s=t.a,r=t.b,n=t.camera.inferScale();e.beginPath(),e.lineJoin="round",e.lineCap="round",e.strokeStyle="black",e.lineWidth=.029*n,e.moveTo(s[0],s[1]),e.lineTo(r[0],r[1]),e.closePath(),e.stroke()},i.pointShader.renderPoint=wt.custom.makePointShader({}),i.lineShader.renderLine=wt.custom.makeFiberShader({});const o=this.dragBehavior=new wt.ui.DragBehavior({onDomCursorDown:(t,e)=>{if("button"in e&&0!=e.button)return;const s=this.system,n=r.domToWorldSpace(t),i=this.hitTestVertex(n);null!=i&&(this.fixVertex(i),o.beginDrag(),this.setVertexPos(s.fixedVertexId,[n[0],Math.max(0,n[1])]))},onDragProgress:t=>{const e=this.system,s=r.domToWorldSpace(t);this.setVertexPos(e.fixedVertexId,[s[0],Math.max(0,s[1])])},onDomCursorUp:()=>{this.freeVertex()}});o.linkToDom(e.domElement),this.targetCenterX=null,this.currentCenterX=null}setSize(t={}){this.renderer.setSize({width:t.width,height:t.height})}render(){if(null==this.needsMeshUpdate||this.needsMeshUpdate){const t=[],e=this.system.triangles.u32();for(let s=0;s<this.system.numTriangles();s++){const r=3*s;t.push([e[r],e[r+1],e[r+2]])}const s=[],r=this.system.springs.u32();for(let t=0;t<this.system.numSprings();t++){const e=2*t;s.push([r[e],r[e+1]])}this._updateMesh({triangles:t,springs:s}),this.needsMeshUpdate=!1}const t=this.renderer,e=this.scene,s=this.camera,r=this.mesh;if(this._updateSim(this.system),!this.dragBehavior.dragging()){const e=r.computeCenter()[0];this.targetCenterX=e,null==this.currentCenterX?this.currentCenterX=this.targetCenterX:this.currentCenterX+=.5*(this.targetCenterX-this.currentCenterX);const n=3,i=this.currentCenterX,o=Math.floor(i/n)*n;this.grid.mesh.setCustomAttribute("translation",[o,0]),this.floor.mesh.setCustomAttribute("translation",[o,0]);const h=[this.currentCenterX,1];s.center({worldCenter:h,worldWidth:3.8,viewportWidth:t.width,viewportHeight:t.height})}t.render(e,s)}_updateMesh(t){const e=this.mesh,s=this.muscleMesh;null!=t.x&&(e.x=t.x,s.x=t.x),e.triangles=t.triangles,e.lines=function(t){const e=new Map;function s(t,s){const r=((n=[t,s]).sort(),n.join("_"));var n;e.set(r,[t,s])}return t.forEach((t=>{s(t[0],t[1]),s(t[1],t[2]),s(t[0],t[2])})),Array.from(e.values())}(t.triangles),s.lines=t.springs;const r=[],n=s.lines.length;for(let t=0;t<n;t++)r.push(1);s.setCustomAttribute("muscleIntensity",r)}_updateSim(t){this.system=t;const e=this.mesh,s=this.muscleMesh,r=t.x0.toArray();e.x=r,s.x=r;const n=[],i=t.numSprings();for(let e=0;e<i;e++)n.push(t.a.slot.f32()[e]);s.setCustomAttribute("muscleIntensity",n)}hitTestVertex(t){const e=this.system.numVertices(),s=this.system.x0.slot.f32();for(let r=0;r<e;r++){const e=2*r,n=[s[e],s[e+1]],i=wt.math.Vec2.sub(n,t);if(wt.math.Vec2.quadrance(i)<.1)return r}return null}setVertexPos(t,e){const s=this.system.x0.slot.f32(),r=2*t;s[r]=e[0],s[r+1]=e[1]}setVertexVel(t,e){const s=this.system.v0.slot.f32(),r=2*t;s[r]=e[0],s[r+1]=e[1]}fixVertex(t){const e=this.system;this.setVertexVel(t,[0,0]),null==t&&(t=-1),e.fixedVertexId=t}freeVertex(){this.system.fixedVertexId=-1}},mm2d:gt});class xt{constructor(t={}){if(null==t.system)throw new Error("system required to create policy");this.system=t.system,this.ten=this.system.ten,this.stochastic=t.stochastic??!1;const e=this.system,s=this.ten,r=e.numVertices(),n=e.numSprings();this.projectedX=s.zeros([r,2]),this.projectedV=s.zeros([r,2]);const i=2*r*2,o=n;this.input=s.zeros([i]),this.active=!1;const h=s.nn;this.model=h.Sequential(h.Linear(i,32),h.ReLU(),h.Linear(32,o),h.Tanh())}step(){const t=this.system,e=this.ten.wasmInstance,s=t.numVertices();let r;this.active&&(e.exports.make_neural_policy_input(s,t.x0.ptr,t.v0.ptr,this.centerVertexId,this.forwardVertexId,this.projectedX.ptr,this.projectedV.ptr,this.input.ptr),r=this.model.forward(this.input));const n=this.minA,i=this.maxAbsDa,o=this.system.a.slot.f32(),h=this.system.numSprings();for(let t=0;t<h;t++){let e;this.active?(e=r.get([t]),this.stochastic&&(e+=.5*(Math.random()-.5))):e=1,e>i&&(e=i),e<-i&&(e=-i);let s=o[t]+e;s<n&&(s=n),s>1&&(s=1),o[t]=s}}loadData(t){const e=this.model.layers[0];e.weight.set(t.fc1.weight),e.bias.set(t.fc1.bias);const s=this.model.layers[2];s.weight.set(t.fc2.weight),s.bias.set(t.fc2.bias),this.minA=t.min_a??(()=>{throw new Error("min_a required")})(),this.maxAbsDa=t.max_abs_da??(()=>{throw new Error("max_abs_da required")})(),this.centerVertexId=t.center_vertex_id??(()=>{throw new Error("center_vertex_id required")})(),this.forwardVertexId=t.forward_vertex_id??(()=>{throw new Error("forward_vertex_id required")})()}}class vt{constructor(t={}){const e=this.domElement=document.createElement("div");e.style.userSelect="none",e.style.webkitTapHighlightColor="transparent",e.style.padding="12px",e.style.cursor="pointer",e.style.borderRadius="50%",e.style.width="78px",e.style.height="78px",e.style.minHeight=e.style.height,e.style.margin="4px",e.style.display="flex",e.style.alignItems="center",e.style.justifyContent="center",e.style.boxShadow="0 0 8px rgba(0, 0, 0, 0.2)";const s=new Image;s.src=t.src;s.style.width="40px",s.style.height="40px",e.appendChild(s),this.setInactiveStyle()}setActiveStyle(){this.domElement.style.backgroundColor="black"}setInactiveStyle(){this.domElement.style.backgroundColor="rgba(1, 1, 1, 0.2)"}}const bt="#000000";class St extends yt.SystemViewport{constructor(t={}){super(t),this.domElement.style.borderRadius="10px",this.domElement.style.border="2px solid #c9c9c9",this.domElement.style.boxShadow="0 0 10px rgba(0, 0, 0, 0.1)";const e=window.matchMedia("(max-width: 425px)"),s=()=>{e.matches?this.setSize({width:350,height:350}):this.setSize({width:400,height:400})};e.addEventListener("change",(t=>{s()})),s()}}!async function(){!function(){const t=document.createElement("a");document.body.appendChild(t),t.href="https://github.com/juniorrojas/algovivo",t.classList.add("github-corner"),t.ariaLabel="View source on GitHub";const e=bt;t.innerHTML=`<svg class="view-on-github" width="80" height="80" viewBox="0 0 250 250" style="fill:#ffffff; color:${e}; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg></a><style>.view-on-github{cursor: pointer}.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}</style>`}(),function(){const t=document.createElement("div");var e;document.body.appendChild(t),(e=t.style).display="flex",e.flexDirection="column",e.alignItems="center",e.color="white",e.width="100%",e.backgroundColor=bt,e.paddingTop="20px",e.paddingBottom="20px",e.paddingRight="50px",e.paddingLeft="50px",e.marginBottom="30px",e.boxShadow="0 0 10px rgba(0, 0, 0, 0.3)";const s=document.createElement("h1");s.textContent="algovivo",t.appendChild(s),(t=>{t.fontSize="33px"})(s.style);const r=document.createElement("h2");r.textContent="an energy-based formulation for soft-bodied virtual creatures",t.appendChild(r),(t=>{t.textAlign="center",t.fontSize="18px",t.color="#c7c7c7"})(r.style)}(),document.body.style.background="rgb(248, 248, 248)",document.body.style.display="flex",document.body.style.flexDirection="column";const t=document.createElement("div");document.body.appendChild(t);const e=await async function(){const t=await fetch("algovivo.wasm");return(await WebAssembly.instantiateStreaming(t)).instance}(),s=new yt.System({wasmInstance:e});document.documentElement.style.height="100%",document.body.style.height="100%",document.body.style.display="flex",document.body.style.margin=0,document.body.style.padding=0,document.body.style.alignItems="center";const r=new St({system:s});t.appendChild(r.domElement);const n="data",[i,o]=await Promise.all([async function(){const t=await fetch(`${n}/mesh.json`);return await t.json()},async function(){const t=await fetch(`${n}/policy.json`);return await t.json()}].map((t=>t())));s.set({x:i.x,springs:i.springs,springsL0:i.l0,triangles:i.triangles,trianglesRsi:i.rsi});const h=new xt({system:s,stochastic:!0});h.loadData(o);const l=new vt({src:"assets/brain.svg"});l.domElement.addEventListener("click",(()=>{h.active=!h.active,h.active?l.setActiveStyle():l.setInactiveStyle()})),document.body.appendChild(l.domElement),r.render(),setInterval((()=>{h.step(),s.step(),r.render()}),1e3/30),window.system=s}();
