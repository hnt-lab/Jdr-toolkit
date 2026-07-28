// Images légères des découvertes, compatibles avec le forfait Firebase Spark.
// Chaque image vit dans un document Firestore séparé du document campagne.
const discoveryImageService={
  MAX_INPUT:8*1024*1024,
  MAX_OUTPUT:240*1024,
  MAX_SIDE:1600,
  MIME:new Set(['image/jpeg','image/png','image/webp']),
  _urls:new Map(),
  assetId(){
    if(globalThis.crypto?.randomUUID)return crypto.randomUUID();
    return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  },
  async prepare(file){
    if(!file) return null;
    if(!this.MIME.has(file.type))throw new Error('Format accepté : JPG, PNG ou WebP.');
    if(file.size>this.MAX_INPUT)throw new Error('Image source trop lourde (8 Mio maximum).');
    const bitmap=await createImageBitmap(file);
    const scale=Math.min(1,this.MAX_SIDE/Math.max(bitmap.width,bitmap.height));
    const width=Math.max(1,Math.round(bitmap.width*scale));
    const height=Math.max(1,Math.round(bitmap.height*scale));
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    canvas.getContext('2d').drawImage(bitmap,0,0,width,height);
    if(bitmap.close)bitmap.close();
    let quality=.84,blob=null;
    do{
      blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));
      quality-=.08;
    }while(blob&&blob.size>this.MAX_OUTPUT&&quality>=.52);
    if(!blob||blob.size>this.MAX_OUTPUT)throw new Error("L'image reste trop lourde après compression (240 Ko maximum).");
    return{blob,width,height,mime:blob.type||'image/webp',size:blob.size};
  },
  async _dataUrl(blob){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(new Error("Lecture de l'image impossible."));
      reader.readAsDataURL(blob);
    });
  },
  async upload(campaignId,file,alt){
    if(typeof fbDb==='undefined')throw new Error('Base de données indisponible.');
    const prepared=await this.prepare(file);
    const id=this.assetId();
    const dataUrl=await this._dataUrl(prepared.blob);
    await fbDb.collection('campaigns').doc(campaignId).collection('media').doc(id).set({
      kind:'discovery',
      dataUrl,
      mime:prepared.mime,
      width:prepared.width,
      height:prepared.height,
      size:prepared.size,
      alt:String(alt||'').trim()||null,
      createdBy:currentUser.uid,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    this._urls.set(`${campaignId}/${id}`,Promise.resolve(dataUrl));
    return{mediaId:id,mime:prepared.mime,width:prepared.width,height:prepared.height,size:prepared.size,alt:String(alt||'').trim()||null};
  },
  async url(campaignId,image){
    if(!image?.mediaId)return null;
    const key=`${campaignId}/${image.mediaId}`;
    if(!this._urls.has(key))this._urls.set(key,(async()=>{
      const snap=await fbDb.collection('campaigns').doc(campaignId).collection('media').doc(image.mediaId).get();
      if(!snap.exists)throw new Error('Image introuvable.');
      return snap.data().dataUrl;
    })());
    return this._urls.get(key);
  },
  async remove(campaignId,image){
    if(!image?.mediaId)return;
    this._urls.delete(`${campaignId}/${image.mediaId}`);
    await fbDb.collection('campaigns').doc(campaignId).collection('media').doc(image.mediaId).delete();
  },
  bind(root,campaignId){
    (root||document).querySelectorAll('img[data-discovery-media]').forEach(async img=>{
      if(img.dataset.bound)return;img.dataset.bound='1';
      try{img.src=await this.url(campaignId,{mediaId:img.dataset.discoveryMedia});}
      catch(e){img.closest('.ds-discovery-media')?.classList.add('load-failed');}
    });
  }
};
