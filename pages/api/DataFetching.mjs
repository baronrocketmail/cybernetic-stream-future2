import { initializeApp } from "firebase/app";
import {getFirestore, query, where, collection, getDocs , addDoc, serverTimestamp, doc, updateDoc, setDoc, getDoc} from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyDPGmgTxlAsVkakZrGbs8NTF2r0RcWu_ig",
    authDomain: "luminous-lambda-364207.firebaseapp.com",
    projectId: "luminous-lambda-364207",
    storageBucket: "luminous-lambda-364207.appspot.com",
    messagingSenderId: "518969290682",
    appId: "1:518969290682:web:d7be744cb378ec83d4f783"
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore()

const allUnitsCollection = collection(firestore, "/future units/")

//d

export async function fetchAllUnits() {
    return new Promise(function(resolve, reject) {
        getDocs(allUnitsCollection).then(snapshot => {
            let array = [];
            snapshot.forEach(elem => array.push(elem.id))
            resolve(fetchAllUnitsDataObj(array))
        })
    })
}
export async function fetchAllUnitsDataObj(idArray) {
    let returnObj = {};
    for (let elem in idArray) {
        let JSONstring = await getAllDataSpecificProperty(idArray[elem]).then(x=> JSON.stringify(x))
        returnObj[idArray[elem]] = JSON.parse(JSONstring)
    }
    return new Promise(function(resolve, reject) {
        resolve(returnObj)
    })
}
export async function getAllDataSpecificProperty(propertyID){
    let info = await getCollection(propertyID, "info").then((x)=> JSON.stringify(x))
    let payments = await getCollection(propertyID, "payments").then((x)=> JSON.stringify(x))

    return new Promise(function(resolve, reject){
        let returnObj = {info: JSON.parse(info) , payments: JSON.parse(payments) }
        resolve(returnObj)
    })
}
async function getCollection(propertyID, collectionID) {
    let returnObj = {}
    const querySnapshot = await getDocs(collection(firestore,'/future units/' + propertyID+"/"+collectionID+"/"));
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        returnObj[doc.id] = doc.data()
    });
    return new Promise(function(resolve, reject){
        resolve(returnObj)
    })
}







export async function uploadStateChange(gridState){
    return new Promise(function(resolve,reject) {
        setDoc(doc(firestore, "websites/cybernetic stream future/states", "main"),  { createdAt: serverTimestamp(), gridState: JSON.stringify(gridState)}).then(resolve("state updated"))
    })
}

export async function uploadNewCellState(newCellState, oldCellState){
    return new Promise(async function(resolve, reject) {
        for(let key in newCellState){
            if (newCellState[key] !== oldCellState[key]) {
                console.log(key)
                const docRef = doc(firestore, "future units/"+newCellState.id+"/info/info");
                let update = { }
                update[key] = newCellState[key]
                console.log(update)
                await updateDoc(docRef, update).then((x) => resolve(newCellState))
            }
        }
        resolve(oldCellState)

    })
}

export async function uploadColumnVisibility(gridState){ return new Promise(function(resolve,reject) {
        setDoc(doc(firestore, "websites/cybernetic stream future/states", "ColumnVisibilityModel"),  { createdAt: serverTimestamp(), gridState: JSON.stringify(gridState)}).then(resolve("state updated"))
})
}

export async function getInitialState(docID){
    return new Promise(function(resolve, reject){
        getDoc(doc(firestore, "websites/cybernetic stream future/states", docID)).then(x => resolve((JSON.parse(x.data().gridState))))
    })
}



export async function uploadGridStateObj(gridState, docName) {
    return new Promise(function(resolve, reject) {
        setDoc(doc(firestore, "websites/cybernetic stream future/states",docName), {createdAt: serverTimestamp(), gridState: JSON.stringify(gridState)})
    })
}