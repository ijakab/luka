 const BaseService = use('App/Services/BaseService')
 
 class BaseScopedService extends BaseService {
     static async getScopedInstance(ctx, ...params) {
         //viable only in scoped service which implemented getScope() method... javascript has not interfaces :(
         let instance = new this(ctx)
         if(!instance.getScope) {
             this.throwError(500, `Trying to get scoped instance on service ${this.name} that did not implement getScope method`)
         }
         await instance.getScope(...params)
         return instance
     }
    
     async getInstance(instanceOrId) {
         if (typeof instanceOrId === 'object') return instanceOrId
         return await this.getSingle(instanceOrId).first()
     }
    
     delete(...params) {
         return super.delete(this.mainInstance)
     }
    
     async update(...params) {
         return super.update(this.mainInstance, ...params)
     }
 }
 
 module.exports = BaseScopedService
 
