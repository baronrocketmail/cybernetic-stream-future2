import {DataGridPremium, GridToolbar, useGridApiRef, useGridApiContext} from "@mui/x-data-grid-premium";
import {fetchAllUnits, getInitialState, uploadGridStateObj, uploadStateChange} from "./api/DataFetching.mjs";
import {uploadNewCellState} from "./api/DataFetching.mjs";
import React, {createContext, useContext, useState} from "react";
import {Box, ThemeProvider, createTheme, colors} from "@mui/material";
import {objectToRows,objectToColumns,getPaymentsDataset, objectToColumnsSecondary} from "./api/dataTransformations"
import { GridApi } from '@mui/x-data-grid-premium';
import { initializeApp } from "firebase/app";
import {getFirestore, query, where, collection, getDocs , addDoc, serverTimestamp, doc, updateDoc, setDoc, getDoc} from "firebase/firestore";

export async function getStaticProps(){
        let primaryGridAPIStateExport = await getInitialState("APIStateExport")
        let primaryColumnVisibilityModel = await getInitialState("ColumnVisibilityModel")

    let initialPrimaryGridState = primaryGridAPIStateExport
        initialPrimaryGridState.columns.columnVisibilityModel = primaryColumnVisibilityModel
        initialPrimaryGridState.preferencePanel.open = false


    let data = await fetchAllUnits()

    return{
        props: {data, initialPrimaryGridState},
        revalidate: 1
    }
}

const PrimaryGridColumnsContext = createContext({})
const PrimaryGridRowsContext = createContext({})
const SecondaryGridColumnsContext = createContext({})
const SecondaryGridRowsContext = createContext({})
const PaymentsDatasetContext = createContext({})


export default function Home(props) {

    console.log(props.initialPrimaryGridState)

    let colors = ["#b71c1c", "#880e4f", "#4a148c", "#d50000", "#c51162", "#aa00ff", "#311b92", "#1a237e", "#0d47a1", "#6200ea", "#304ffe", "#2962ff", "#01579b", "#0091ea", "#4caf50"]
    let color =  colors[Math.floor(Math.random()*colors.length)]

    const theme = createTheme({
        palette: {
            primary:{
                main: color,
            },
        },
        typography : {
            fontFamily: ["Goldman Sans"],
        },
    })

    const [data, setData] = useState(props.data)
    const [paymentsDataset, setPaymentsDataset] = useState(getPaymentsDataset(data))
    const [primaryGridColumns, setPrimaryGridColumns] = useState(objectToColumns(data))
    const [primaryGridRows, setPrimaryGridRows] = useState(objectToRows(data))
    const [secondaryGridColumns, setSecondaryGridColumns] = useState(objectToColumnsSecondary(data))
    const [secondaryGridRows, setSecondaryGridRows] = useState([])

    return (
        <>
            <ThemeProvider theme={theme}>
                <PrimaryGridColumnsContext.Provider value = {{primaryGridColumns, setPrimaryGridColumns}}>
                <PrimaryGridRowsContext.Provider value = {{primaryGridRows, setPrimaryGridRows}}>
                <SecondaryGridColumnsContext.Provider value = {{secondaryGridColumns, setSecondaryGridColumns}}>
                <SecondaryGridRowsContext.Provider value = {{secondaryGridRows, setSecondaryGridRows}}>
                <PaymentsDatasetContext.Provider value = {{paymentsDataset, setPaymentsDataset}}>
                    <PrimaryGrid initialState = {props.initialPrimaryGridState}/>
                <SecondaryGrid/>
                </PaymentsDatasetContext.Provider>
                </SecondaryGridRowsContext.Provider>
                </SecondaryGridColumnsContext.Provider>
                </PrimaryGridRowsContext.Provider>
                </PrimaryGridColumnsContext.Provider>
            </ThemeProvider>
        </>
    )
}

 function SecondaryGrid(props){

     const columnsObj = useContext(SecondaryGridColumnsContext)
     const rowsObj = useContext(SecondaryGridRowsContext)


     return(
         <Box sx={{height: "100vh", width: "100%"}}>
             <DataGridPremium
                 components={{Toolbar: GridToolbar}}
                 rowReordering
                 density = "compact"
                 experimentalFeatures={{aggregation: true}}
                 checkboxSelection
                 columns={columnsObj.secondaryGridColumns}
                 rows={rowsObj.secondaryGridRows}/>
         </Box>
     )
 }

function PrimaryGrid(props){
    console.log(props.initialState)

    const columnsObj = useContext(PrimaryGridColumnsContext)
    const rowsObj = useContext(PrimaryGridRowsContext)

    const paymentsDatasetObj = useContext(PaymentsDatasetContext)
    const secondaryGridRowsObj = useContext(SecondaryGridRowsContext)

    //s
    const apiRef = useGridApiRef()

    function onPrimaryGridSelectionModelChange(selectionModel) {
        let array = []
        for (let propertyName in selectionModel) {
            let datasetKey = selectionModel[propertyName]
            array.push(... paymentsDatasetObj.paymentsDataset[datasetKey])
        }
        secondaryGridRowsObj.setSecondaryGridRows(array)
    }

    function getPrimaryGridDetailPanelContent(props) {
        return(
            <>
            <h1>{props.row.name + ", " + props.row["monthly price"]}</h1>
            </>
        )
    }

    function onColumnVisibilityModelChange(x){
        console.log(x)
        uploadGridStateObj(apiRef.current.exportState(),"APIStateExport")
        uploadGridStateObj(x, "ColumnVisibilityModel")
    }

    return (
        <Box sx={{height: "100vh", width: "100%" , border: "0px solid black"}}>
            <DataGridPremium
                apiRef={apiRef}
                initialState = {props.initialState}
                rowReordering
                density ="compact"
                onColumnVisibilityModelChange = {onColumnVisibilityModelChange }
                processRowUpdate={uploadNewCellState}
                components={{Toolbar: GridToolbar}}
                getDetailPanelContent={getPrimaryGridDetailPanelContent}
                getDetailPanelHeight={()=> "auto"}
                experimentalFeatures={{aggregation: true, newEditingApi: true}}
                checkboxSelection
                onSelectionModelChange={onPrimaryGridSelectionModelChange}
                columns={columnsObj.primaryGridColumns}
                rows={rowsObj.primaryGridRows}
            />
        </Box>
    )
}