export function objectToColumns(data) {
    let columns = []
    for (let propertyID in data) {     // traverse all property keys in data
        let infoCollection = data[propertyID].info.info
        for (let documentID in infoCollection) {   // traverse all documents in info
            // for each thing in the info collection
            let found = false // in the thing has a column
            for(let elem in columns) { // for each document in info, check to see if it has a column
                if (columns[elem].field === documentID) {
                    found = true
                }
            }
            if (!found) {
                if (documentID == "monthly price") {
                    columns.push({field: documentID, headerName: documentID, width: 200, editable: true, type: "number"})
                } else {
                    columns.push({field: documentID, headerName: documentID, width: 200, editable: true})

                }

            }
        }

    }


    return columns;
}
export function objectToColumnsSecondary(data) {
    let columns = []
    for(let propertyID in data) {
        let paymentsObj = data[propertyID].payments
        for(let payment in paymentsObj) {
            for(let documentID in paymentsObj[payment]) {
                let found = false
                for(let elem in columns) {
                    if (documentID === columns[elem].field) {
                        found = true
                    }
                }
                if(!found) {
                    columns.push({field: documentID,  headerName: documentID, width: 150})
                }
            }
        }
    }
    return columns
}

export function getPaymentsDataset(data){
    let returnObj = {}
    for (let propertyID in data) {  // for each property,
        let PaymentsObj = data[propertyID].payments  // get the payments object
        let propertyPayments = []
        for(let paymentID in PaymentsObj){   // traverse each payment for the property
            let formattedPropertyPaymentsObj = {id: propertyID + ": " + paymentID}

            for (let docID in PaymentsObj[paymentID]){ // tra

                formattedPropertyPaymentsObj[docID] = PaymentsObj[paymentID][docID]
            }
            propertyPayments.push(formattedPropertyPaymentsObj)
        }
        returnObj[propertyID] = propertyPayments
    }
    return returnObj
}


export function objectToRows(data){

    let rows = []
    // Traverse the Object full of Properties
    for (let propertyID in data){
        // For each property
        let row = {id: propertyID}  // create a new row representing the property

        let propertyInfoCollection = data[propertyID].info.info

        for(let documentName in propertyInfoCollection) { // traverse the info collection
            row[documentName] = propertyInfoCollection[documentName]
        }
        rows.push(row)
    }

    return rows

}
