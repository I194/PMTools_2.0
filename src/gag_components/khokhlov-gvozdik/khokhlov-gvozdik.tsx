import React, { createElement as e, useEffect, useState } from 'react';
import { ZoomedLambertGraph } from "../ZoomedLambertGraph/ZoomedLambertGraph";
import styles from "./khokhlov-gvozdik.module.scss" 
import { Footer, NavPanel } from "../../components/MainPage";
import CACTable from "../CACTable/CACTable";
import {CACResultTable} from "../CACResultTableTest/CACResultTable";

import Tables from '../../pages/DIRPage/Tables';
import Graphs from '../../pages/DIRPage/Graphs';
import ModalWrapper from '../../components/Common/Modal/ModalWrapper';
import UploadModal from '../../components/Common/Modal/UploadModal/UploadModal';
import { IDirData } from '../../utils/GlobalTypes';
import { useAppDispatch, useAppSelector } from '../../services/store/hooks';
import { filesToData } from '../../services/axios/filesAndData';
import { 
    addInterpretation, 
    setStatisticsMode, 
    showSelectionInput, 
    updateCurrentInterpretation 
  } from '../../services/reducers/dirPage';
import calculateStatisticsDIR from '../../utils/statistics/calculateStatisticsDIR';

import {
    GeoVdek,
    getRandomfloat,
    NormalizeV,
    RotateAroundV,
    angle_between_v,
    fisherStat,
    getRandomInt,
    get_quantiles,
    DekVgeo,
    get_perp,
    GridVdek
    } from "../gag_functions";

import HelpCenterOutlinedIcon from '@mui/icons-material/HelpCenterOutlined';
import Tooltip from '@mui/material/Tooltip';   
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useMediaQuery } from 'react-responsive';
import CACResTable from '../CACResTable/CACResTable';

export function Khokhlov_Gvozdik() {
  
    //-----------------------------------------------------------
    // input data generating
    //-----------------------------------------------------------

    var max_lon = 0;
    var min_lon = 10;
    var max_lat = 0;
    var min_lat = 10;

    // for debug
    const [octo, setOcto] = useState<number>(9);

    const octoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const number = parseInt(event.target.value);
        setOcto(number);
    };

    const [step_list, setStepList] = useState<number[]>([]);

    const [dir_list, setDirList] = useState<[number, number, number][]>([]);

    const [dir_number, setDirNumb] = useState<number>(0);


    const [apc, setSelectedAPC] = useState<number>(0);
    const [selectedP, setSelectedP] = useState<number>(990);
    const [selectedD, setSelectedD] = useState<number>(10);


    const [quantiles, setQuantiles] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

	const [angle_list, setAngleList] = useState<number[]>([]);



    useEffect(() => {
        var quantiles = get_quantiles(selectedD, apc, selectedP);
        setQuantiles(quantiles);

        var new_ang_list = [];
        for ( var i = 0; i < dir_number; i ++ ) {
            new_ang_list.push(quantiles[step_list[i] - 3]);
        }
        setAngleList(new_ang_list);
    }, [selectedD, apc, selectedP, dir_number, step_list]);


    const handleDChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const number = parseInt(event.target.value);
        setSelectedD(number);
    };



    const handlePChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const number = parseInt(event.target.value);
        setSelectedP(number);
    };



    const handleAPCChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const number = parseInt(event.target.value);
        setSelectedAPC(number);
    };


    const generateRandomNumbers = () => {
        var random_list = [];
        var dir_number = getRandomInt(5, 7 + 1);

        let maxlot: number = -2.5;
        let minlot:number = 3;
        let maxlat: number = -2;
        let minlat: number = 2;  

        // for debug
        if (octo == 1){
            maxlot = 47;
            minlot = 41;
            maxlat = -40;
            minlat = -47;  
        }

        if (octo == 2){
            maxlot = 137;
            minlot = 130;
            maxlat = -40;
            minlat = -47;  
        }

        if (octo == 3){
            maxlot = 47;
            minlot = 40;
            maxlat = 47;
            minlat = 40;  
        }

        if (octo == 4){
            maxlot = 137;
            minlot = 130;
            maxlat = 47;
            minlat = 40;  
        }

        if (octo == 5){
            maxlot = -40;
            minlot = -47;
            maxlat = -40;
            minlat = -47;  
        }

        if (octo == 6){
            maxlot = -130;
            minlot = -137;
            maxlat = -40;
            minlat = -47;  
        }

        if (octo == 7){
            maxlot = -40;
            minlot = -47;
            maxlat = 47;
            minlat = 40;  
        }

        if (octo == 8){
            maxlot = -130;
            minlot = -137;
            maxlat = 47;
            minlat = 40;  
        }

        if (octo == 9){
            maxlot = 8;
            minlot = -6;
            maxlat = 89;
            minlat = 78;  
        }

        if (octo == 10){
            maxlot = 8;
            minlot = -6;
            maxlat = -89;
            minlat = -78;  
        }


        for (var i = 0; i < dir_number; i++)
        {
            random_list.push(getRandomfloat(minlot, maxlot));
            random_list.push(getRandomfloat(minlat, maxlat));
        }

        var dir_list: [number, number, number][] = [];

        var step_list = [];
        var paleo_data: number[];
        var step = 0;

        let testDir = (GeoVdek(20, 60));
        var random_dir = NormalizeV( testDir );
        random_dir = NormalizeV( [ getRandomfloat(0, 1), getRandomfloat(0, 1), getRandomfloat(0, 1) ] );
        random_dir = NormalizeV( [ 1, 1, 1 ] );
        var random_angle = getRandomfloat(0, 180);  
        random_angle = 0;  

        for ( var i = 0; i < dir_number; i ++ ) {   

            paleo_data = GeoVdek(random_list[i * 2], random_list[i * 2 + 1])
            // paleo_data = NormalizeV(RotateAroundV(paleo_data, random_dir, random_angle));
            step = getRandomInt(6, quantiles.length);


            step_list.push(step);

            //------------------------fix------------------------
            
            // paleo_data = NormalizeV([-1 + getRandomfloat(0, 0.2), -1 + getRandomfloat(0, 0.2), -1  + getRandomfloat(0, 0.2)]);
            dir_list.push([paleo_data[0], paleo_data[1], paleo_data[2]]);
        }

        setDirList(dir_list);
        setStepList(step_list);
        setDirNumb(dir_number);
        setAngleList([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    };

    const [isvis, setIsVisible] = useState(true);
    const handleCheckboxChange = () => {
        setIsVisible(!isvis);
    };

    // const [isdark, setdark] = useState(true);
    // const DarkTeamChange = () => {
    //     setdark(!isdark);
    //     const root = document.documentElement;
    //     root.classList.toggle('dark', !isdark);
    // };

    const [isvisgrid, setisvisgrid] = useState(false);
    const gridCheckboxChange = () => {
        setisvisgrid(!isvisgrid);
    };
    
    const [selectedNumber, setSelectedNumber] = useState<number>(10000);

    const handleNumberChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const number = parseInt(event.target.value);
        setSelectedNumber(number);
    };

    const outsideVariable = selectedNumber;
    var points_numb = outsideVariable;

    const [degree_grid_isvis, setDegree] = useState(true);
    const degreeCheckboxChange = () => {
        setDegree(!degree_grid_isvis);
    };



    //-----------------------------------------------------------------------
    // fisher stat
    //-----------------------------------------------------------------------

    const [sred_dir, alpha95]: [ number[], number] = fisherStat(dir_list);

    //-----------------------------------------------------------------------
    // making grid dots
    //-----------------------------------------------------------------------
    
    var x;
    var y;
    var m;
    var grid_points = [];

    var print_point = 0;
    var print_point = 0;

    var phi = 0.013;
    
    for (var i = 0; i < points_numb; i++)
    {
        x = (i * phi - Math.round(i * phi)) * 360;
        y = (i / points_numb - Math.round(i / points_numb)) * 360;

        m = GridVdek(x, y);


        for (var j = 0; j < dir_list.length; j++ )
        {
            if (angle_between_v(dir_list[j], m) < angle_list[j] * Math.PI / 180)
            {
                print_point = 1;
            }
            else { print_point = 0; break; }
        }

        if (print_point == 1)
        {
            grid_points.push(m);

        }
        print_point = 0;
    }

    //---------------------------------------------------------------------------------------
    // center zone calc
    //---------------------------------------------------------------------------------------

    var center_zone = [0,0,0];

    for (var i = 0; i < grid_points.length; i++)
    {
        center_zone[0] += grid_points[i][0];
        center_zone[1] += grid_points[i][1];
        center_zone[2] += grid_points[i][2];
    }
    center_zone = NormalizeV(center_zone);

    //---------------------------------------------------------------------------------------
    // polygon of zone and max radius calculation
    //---------------------------------------------------------------------------------------
    // import * as React from 'react';
    // import { saveAs } from 'file-saver';
    
    // const exportToEPS = (svgElement: SVGSVGElement) => {
    //   const svgData = new XMLSerializer().serializeToString(svgElement);
    
    //   const canvas = document.createElement('canvas');
    //   canvas.width = svgElement.clientWidth;
    //   canvas.height = svgElement.clientHeight;
    
    //   const ctx = canvas.getContext('2d');
    //   const img = new Image();
    //   const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    //   const imgURL = URL.createObjectURL(svgBlob);
    
    //   img.onload = () => {
    //     ctx?.drawImage(img, 0, 0);
    
    //     const canvasBlob = canvas.toDataURL('image/jpeg');
    //     const imgData = canvasBlob.replace(/^data:image\/(png|jpeg);base64,/, '');
    
    //     const epsData = window.atob(imgData);
    //     const bufferArray = new Uint8Array(epsData.length);
    
    //     for (let i = 0; i < epsData.length; i++) {
    //       bufferArray[i] = epsData.charCodeAt(i);
    //     }
    
    //     const epsBlob = new Blob([bufferArray.buffer], { type: 'application/postscript' });
    //     saveAs(epsBlob, 'image.eps');
    //   };
    
    //   img.src = imgURL;
    // };
    
    // const SVGExportButton: React.FC = () => {
    //   const svgRef = React.useRef<SVGSVGElement>(null);
    
    //   const handleExportClick = () => {
    //     if (svgRef.current) {
    //       exportToEPS(svgRef.current);
    //     }
    //   };
    
    //---------------------------------------------------------------------------------------
    // Result Table props
    //---------------------------------------------------------------------------------------


    let rows: Row[] = [];

    // let myList: number[] = [2, 1];


    const [ResultTableRow, setResultTableRow] = useState<Row[]>([]);
    const [resultId, setResultId] = useState<number>(1);

    const calculateResultTable = () => {
        
        setResultId(resultId + 1);

        let newRow = 
            { 
                id: resultId, 
                Code: 'CAC', 
                N: dir_number, 
                Lat: DekVgeo(center_zone)[0].toFixed(2), 
                Lon: DekVgeo(center_zone)[1].toFixed(2), 
                ZoneRad: 999,
                FishLat: DekVgeo(sred_dir)[0].toFixed(2),
                FishLon: DekVgeo(sred_dir)[1].toFixed(2),
                alpha95: alpha95.toFixed(2)
            };
        
        setResultTableRow(prevList => [...prevList, newRow]);
    };
    
    // useEffect(() => {

    //     rows.push(
    //         { 
    //             id: 1, 
    //             Code: 'CAC', 
    //             N: dir_number, 
    //             Lat: DekVgeo(center_zone)[0].toFixed(2), 
    //             Lon: DekVgeo(center_zone)[1].toFixed(2), 
    //             ZoneRad: 999,
    //             FishLat: DekVgeo(sred_dir)[0].toFixed(2),
    //             FishLon: DekVgeo(sred_dir)[1].toFixed(2),
    //             alpha95: alpha95.toFixed(2)
    //         }
    //     )

    //     setResultTableRow(rows);
    // }, [ResultTableRow]);
    


    type Row = {
        id: number,
        Code: string,
        N: number,
        Lat: string,
        Lon: string,
        ZoneRad: number,
        FishLat: string,
        FishLon: string,
        alpha95: string
    };

    //---------------------------------------------------------------------------------------
    // Interface
    //---------------------------------------------------------------------------------------

    var poly_color = "#AAE1BF";
    var grid_color = '#16732f';

    var poly_color = "#5badff";
    var grid_color = '#1975d2';

    //---------------------------------------------------------------------------------------
    // Ванин код из DIRTable
    //---------------------------------------------------------------------------------------
    

    const dispatch = useAppDispatch();
    const widthLessThan720 = useMediaQuery({ maxWidth: 719 });
    const heightLessThan560 = useMediaQuery({ maxHeight: 559 });
    const unsupportedResolution = widthLessThan720 || heightLessThan560;

    const files = useAppSelector(state => state.filesReducer.dirStatFiles);
    const { dirStatData, currentDataDIRid } = useAppSelector(state => state.parsedDataReducer);
    const { 
        statisticsMode, 
        selectedDirectionsIDs, 
        hiddenDirectionsIDs, 
        reversedDirectionsIDs,
        currentFileInterpretations,
        allInterpretations
    } = useAppSelector(state => state.dirPageReducer);

    const [dataToShow, setDataToShow] = useState<IDirData | null>(null);
    const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

    useEffect(() => {
        if (files) dispatch(filesToData({files, format: 'dir'}));
    }, [files, files?.length]);

    useEffect(() => {
        if (dirStatData && dirStatData.length > 0) {
        const dirID = currentDataDIRid || 0;
        setDataToShow(dirStatData[dirID]);
        } else setDataToShow(null);
    }, [dirStatData, currentDataDIRid, hiddenDirectionsIDs]);

    useEffect(() => {
        if (statisticsMode && !selectedDirectionsIDs) dispatch(showSelectionInput(true));
        if (statisticsMode && selectedDirectionsIDs && selectedDirectionsIDs.length >= 2 && dataToShow) {
        const statistics = calculateStatisticsDIR(dataToShow, statisticsMode, selectedDirectionsIDs, reversedDirectionsIDs);
        statistics.interpretation.label = `${allInterpretations.length}${statistics.interpretation.label}/${currentFileInterpretations.length}`;
        dispatch(addInterpretation(statistics));
        dispatch(setStatisticsMode(null));
        } else dispatch(updateCurrentInterpretation());
    }, [statisticsMode, selectedDirectionsIDs, dataToShow]);

    useEffect(() => {
        if (!dataToShow) setShowUploadModal(true);
        else setShowUploadModal(false);
    }, [dataToShow]);







    if (unsupportedResolution) return <>Размер окна должен быть не меньше чем 720x560</>
    return (
        <div className={styles.main_container}>
            <h3 className={styles.lowScreen}>Размер окна должен быть не меньше чем 720x560</h3>
            
            
            {/* <div className={styles.table2_container + ' ' + styles.commonContainer}>
                <CACResultTable 
                    rows={ResultTableRow}
                />
            </div> */}
            
            
            <div className={styles.graph_container + ' ' + styles.commonContainer}>
                
                <div className={styles.interfaceTooltip}>
                    <HelpCenterOutlinedIcon className={styles.question}/>
                    <FileDownloadOutlinedIcon className={styles.question}/>
                </div>

                <ZoomedLambertGraph
                    centerZone={center_zone}
                    dirList={dir_list}
                    angleList={angle_list}
                    gridPoints={grid_points}
                    meanDir={sred_dir}
                    alpha95={alpha95}
                    gridColor={grid_color}
                    polygonColor={poly_color}
                    showGrid={isvisgrid}
                    showDegreeGrid={degree_grid_isvis}
                    showPolygon={isvis}
                />

            </div>



                <CACTable dataToShow={dataToShow}/> 
                {/* <CACResTable dataToShow={dataToShow}/>   */}

            
                <ModalWrapper
                    open={showUploadModal}
                    setOpen={setShowUploadModal}
                    size={{width: '60vw', height: '60vh'}}
                    showBottomClose
                >
                <UploadModal page='dir' />
                </ModalWrapper>


                <div className={styles.table2_container + ' ' + styles.commonContainer}>

                </div>

                {/* <div className={styles.table_container + ' ' + styles.commonContainer}> */}
                {/* </div> */}

                {/* <div className={styles.table2_container + ' ' + styles.commonContainer}>
                </div> */}

            {/* <div className={styles.table_container + ' ' + styles.commonContainer}> */}
                {/* <CACTable /> */}
                
                
                {/* for debug */}
                {/* <h3>Debug panel</h3>

                <div className={styles.debug}>
                    

                    <div className={styles.debugItem1}>
                        <button className={styles.button} onClick={generateRandomNumbers}>Generate Random Numbers</button>
                    </div>
                    
                    <div className={styles.debugItem2}>
                        <select className={styles.my_select} value={octo} onChange={octoChange}>
                            <option value={1}>+++</option>
                            <option value={2}>++-</option>
                            <option value={3}>+-+</option>
                            <option value={4}>+--</option>
                            <option value={5}>-++</option>
                            <option value={6}>-+-</option>
                            <option value={7}>--+</option>
                            <option value={8}>---</option>
                            <option value={9}>0 1 0</option>
                            <option value={10}>0 -1 0</option>
                        </select>
                    </div>
                </div>

                <br></br> */}

            {/* </div> */}



            <div className={styles.container + ' ' + styles.commonContainer}>

                <div className={styles.interfaceTooltip}>
                    <HelpCenterOutlinedIcon className={styles.question}/>
                </div>
                <br></br>

                <div className={styles.interface}>
                    <select className={styles.select1Item + ' ' + styles.item + ' ' + styles.my_select} value={selectedNumber} onChange={handleNumberChange}>
                        <option value={10000}>N = 10 000</option>
                        <option value={50000}>N = 50 000</option>
                        <option value={100000}>N = 100 000</option>
                        <option value={250000}>N = 250 000</option>
                        <option value={500000}>N = 500 000</option>
                        <option value={1000000}>N = 1 000 000</option>
                    </select>
                    
                    <select className={styles.select2Item + ' ' + styles.item + ' ' + styles.my_select} value={selectedD} onChange={handleDChange}>
                        <option value={10}>d = 10</option>
                        <option value={5}>d = 5</option>
                    </select>

                    <select className={styles.select3Item + ' ' + styles.item + ' ' + styles.my_select} value={selectedP} onChange={handlePChange}>
                        <option value={950}>quantile = 0.950</option>
                        <option value={975}>quantile = 0.975</option>
                        <option value={990}>quantile = 0.99</option>
                    </select>

                    <select className={styles.select4Item + ' ' + styles.item + ' ' + styles.my_select} value={apc} onChange={handleAPCChange}>
                        <option className={styles.selectOption} value={1}>aPC</option>
                        <option className={styles.selectOption} value={0}>PC</option>
                    </select>

                    <div className={styles.buttonItem + ' ' + styles.item}>
                        <button className={styles.button} onClick={calculateResultTable}>Calculate result table</button>
                    </div>
                        {/* <b>The percentage of the zone from the sphere:</b>
                        {" " + String((zone_square(grid_points.length, points_numb) * 100).toFixed(3))}%.
                        <br/>
                        <b>Maxium radius of the zone: </b>{max_rad.toFixed(3)}
                        <br/>
                        <b>&#945;95: </b>{alpha95.toFixed(3)}
                        <br/> */}

                    <div className={styles.infoItem1}>
                        <label className={styles.my_input}><div className={styles.info}>Show zone</div>
                            <input type="checkbox" checked={isvis} onChange={handleCheckboxChange}/>
                            <span className={styles.checkmark}></span>
                        </label>
                    </div>

                    <div className={styles.infoItem2}>
                        <label className={styles.my_input}><div className={styles.info}>Show grid</div>
                            <input type="checkbox" checked={isvisgrid} onChange={gridCheckboxChange}/>
                            <span className={styles.checkmark}></span>
                        </label>
                    </div>

                    <div className={styles.infoItem3}>
                        <label className={styles.my_input}><div className={styles.info}>show degree grid</div>
                            <input type="checkbox" checked={degree_grid_isvis} onChange={degreeCheckboxChange}/>
                            <span className={styles.checkmark}></span>
                        </label>
                    </div>


                </div>
            </div>
        </div>
    );
}




