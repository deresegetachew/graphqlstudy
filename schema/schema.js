const graphql = require('graphql');
const {GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema,GraphQLList,GraphQLNonNull} = graphql;
const _ = require('lodash');
const axios  = require('axios');
const baseUrl = 'http://localhost:3000';

const companyType =  new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        },  
        "description":{
            type:GraphQLString
        },
        users:{
            type: new GraphQLList(userType),
            resolve(parentValue,args){
                return axios.get(`${baseUrl}/company/${parentValue.id}/users`).then((res) => res.data);
            }
        }
    })
})

const userType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {
            type: GraphQLString
        },
        firstName: {
            type: GraphQLString
        },
        age: {
            type: GraphQLInt
        } ,
        company:{
            type:companyType,
            resolve(parentValue,args){               
                return axios.get(`${baseUrl}/companies/${parentValue.companyId}`).then((res) => res.data) ;
            }
        }      
    })
});
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
        user: {
            type: userType,
            args: {
                id: { type: GraphQLString}
            },
            resolve(parentValue, args, request) {                          
                return axios.get(`${baseUrl}/users/${args.id}`).then((res)=>res.data);
            }
        },
        company:{
            type:companyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue,args,request){
                return axios.get(`${baseUrl}/companies/${args.id}`).then((res)=>res.data);
                }
            }
    })
});

const mutation = new GraphQLObjectType({
    name:'Mutation',
    fields:() => ({
        addUser : {
            type: userType,
            args:{                
                firstName: {type:new GraphQLNonNull(GraphQLString)},
                age:{type: new GraphQLNonNull(GraphQLInt)},
                companyId:{type:GraphQLString}
            },
            resolve(parentValue,{firstName,age}){
                return axios.post(`${baseUrl}/users`,{firstName,age}).then(res => res.data);
            }
        },
        deleteUser : {
            type:userType,
            args : { id:{type: new GraphQLNonNull(GraphQLString)} },
            resolve(parentValue,{id}){
                return axios.delete(`${baseUrl}/users/${id}`).then((res) => res.data);
            }
        },
        editUser : {
            type:userType,
            args:{
                id:{type: new GraphQLNonNull(GraphQLString)},
                firstName:{type:GraphQLString},
                age:{type:GraphQLInt},
                companyId:{type:GraphQLString}
            },
            resolve(parentValue,args){
                return axios.patch(`${baseUrl}/users/${args.id}`,args).then(res => res.data);
            }
        }
    })
})

module.exports =   new GraphQLSchema ({ query:RootQuery,mutation });