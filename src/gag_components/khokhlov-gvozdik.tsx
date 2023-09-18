import React, {createElement as e, useEffect, useState} from 'react';
import {ZoomedLambertGraph} from "./ZoomedLambertGraph";
import {TooltipContent} from "./my-tooltip";


import "./style.css";
import {
    GeoVdek,
    getRandomfloat,
    NormalizeV,
    RotateAroundV,
    angle_between_v,
    fisherStat,
    getRandomInt,
    get_quantiles
    } from "./gag_functions";

import HelpCenterOutlinedIcon from '@mui/icons-material/HelpCenterOutlined';
import Tooltip from '@mui/material/Tooltip';   
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useMediaQuery } from 'react-responsive';

export function Khokhlov_Gvozdik() {
  
    //-----------------------------------------------------------
    // input data generating
    //-----------------------------------------------------------

    var max_lon = 0;
    var min_lon = 10;
    var max_lat = 0;
    var min_lat = 10;

   
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
        console.log('angles changed');
        console.log(new_ang_list);

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
        var dir_number = getRandomInt(5, 9 + 1);

        for (var i = 0; i < dir_number; i++)
        {
            random_list.push(getRandomfloat(min_lat, max_lat));
            random_list.push(getRandomfloat(min_lon, max_lon));
        }

        var dir_list: [number, number, number][] = [];

        var step_list = [];
        var paleo_data: number[];
        var step = 0;

        var random_dir = NormalizeV( [ getRandomfloat(0, 1), getRandomfloat(0, 1), getRandomfloat(0, 1) ] );
        var random_angle = getRandomfloat(0, 180);

        for ( var i = 0; i < dir_number; i ++ ) {

            paleo_data = GeoVdek(1, random_list[i * 2], random_list[i * 2 + 1])
            paleo_data = NormalizeV(RotateAroundV(paleo_data, random_dir, random_angle));
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

    const [isdark, setdark] = useState(true);
    const DarkTeamChange = () => {
        setdark(!isdark);
        const root = document.documentElement;
        root.classList.toggle('dark', !isdark);
    };

    const [isvisgrid, setisvisgrid] = useState(false);
    const gridCheckboxChange = () => {
        setisvisgrid(!isvisgrid);
    };
    
    const [selectedNumber, setSelectedNumber] = useState<number>(100000);

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
    const [rumbs_isvis, setRumbs] = useState(true);
    const rumbCheckboxChange = () => {
        setRumbs(!rumbs_isvis);
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

        m = GeoVdek(1, x, y);


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

    //---------------------------------------------------------------------------------------
    // Interface
    //---------------------------------------------------------------------------------------

    var poly_color = "#AAE1BF";
    var grid_color = '#16732f';

    var poly_color = "#5badff";
    var grid_color = '#1975d2';

    
 
    // Функция для загрузки SVG
    const handleDownloadSVG = () => {
        const svgElement = document.querySelector('.graph_interface');
        if (!svgElement) {
            console.error('SVG element not found');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svgElement);

        const downloadLink = document.createElement('a');
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = 'graph.svg';

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="main_container">
            <h3 className="low-screen">Размер окна должен быть не меньше чем 720x560</h3>
            <div className="graph_container common-container">
                <Tooltip className="my-tooltip" title={<TooltipContent 
                    type={'graph'}
                    sred_dir={sred_dir}
                    center_zone={center_zone}
                    dir_list={dir_list}
                    angle_list={angle_list}
                />} arrow>               
                    <HelpCenterOutlinedIcon className='graph-tooltip'/>
                </Tooltip>
                <a onClick={handleDownloadSVG}>
                    <Tooltip className="my-tooltip" title={<TooltipContent 
                        type={'download svg'} 
                        sred_dir={sred_dir}
                        center_zone={center_zone}
                        dir_list={dir_list}
                        angle_list={angle_list}
                    />} arrow>
                        <FileDownloadOutlinedIcon  className='graph-tooltip'/>
                    </Tooltip>
                </a>
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
                    showRumbs={rumbs_isvis}
                    showPolygon={isvis}
                />

            </div>
            <div className="table_container common-container">
                {sred_dir[0]}
                <br></br>
                {sred_dir[1]}
                <br></br>
                {sred_dir[2]}
                <br></br>

            </div>
            <div className="table2_container common-container">
                <label className="my_input">
                    <div className="info">dark mode</div>
                    <input type="checkbox" checked={isdark} onChange={DarkTeamChange}/>
                    <span className="checkmark"></span>
                </label>
            </div>
            <div className="container common-container">
                <div className='interface-tooltip'>
                    <Tooltip 
                        style={{}}
                        title={
                            <TooltipContent 
                                type={'checkbox'} 
                                sred_dir={sred_dir}
                                center_zone={center_zone}
                                dir_list={dir_list}
                                angle_list={angle_list}            
                            />
                        } 
                        arrow
                    >
                        <HelpCenterOutlinedIcon className='interface-tooltip'/>
                    </Tooltip>
                </div>
                <div className="interface">
                    <select className="select1-item item my_select" value={selectedNumber} onChange={handleNumberChange}>
                        <option value={10000}>grid = 10 000</option>
                        <option value={50000}>grid = 50 000</option>
                        <option value={100000}>grid = 100 000</option>
                        <option value={250000}>grid = 250 000</option>
                        <option value={500000}>grid = 500 000</option>
                        <option value={1000000}>grid = 1 000 000</option>
                        <option value={1500000}>grid = 1 500 000</option>
                        <option value={2000000}>grid = 2 000 000</option>
                        <option value={2500000}>grid = 2 500 000</option>
                    </select>
                    
                    <select className="select2-item item my_select" value={selectedD} onChange={handleDChange}>
                        <option value={10}>d = 10</option>
                        <option value={5}>d = 5</option>
                    </select>
                    <select className="select3-item item my_select" value={selectedP} onChange={handlePChange}>
                        <option value={950}>quantile = 0.950</option>
                        <option value={975}>quantile = 0.975</option>
                        <option value={990}>quantile = 0.99</option>
                    </select>
                    <select className="select4-item item my_select" value={apc} onChange={handleAPCChange}>
                        <option className="select-option" value={1}>aPC</option>
                        <option className="select-option" value={0}>PC</option>
                    </select>
                    <div className="button-item item">
                        <button className="button" onClick={generateRandomNumbers}>Generate Random Numbers</button>
                    </div>
                        {/* <b>The percentage of the zone from the sphere:</b>
                        {" " + String((zone_square(grid_points.length, points_numb) * 100).toFixed(3))}%.
                        <br/>
                        <b>Maxium radius of the zone: </b>{max_rad.toFixed(3)}
                        <br/>
                        <b>&#945;95: </b>{alpha95.toFixed(3)}
                        <br/> */}
                    <div className="info-item1">
                        <label className="my_input"><div className="info">Show zone</div>
                            <input type="checkbox" checked={isvis} onChange={handleCheckboxChange}/>
                            <span className="checkmark"></span>
                        </label>
                    </div>
                    <div className="info-item2">
                        <label className="my_input"><div className="info">Show grid</div>
                            <input type="checkbox" checked={isvisgrid} onChange={gridCheckboxChange}/>
                            <span className="checkmark"></span>
                        </label>
                    </div>
                    <div className="info-item3">
                        <label className="my_input"><div className="info">show degree grid</div>
                            <input type="checkbox" checked={degree_grid_isvis} onChange={degreeCheckboxChange}/>
                            <span className="checkmark"></span>
                        </label>
                    </div>
                    <div className="info-item4">
                        <label className="my_input"><div className="info">show rumbs</div>
                            <input type="checkbox" checked={rumbs_isvis} onChange={rumbCheckboxChange}/>
                            <span className="checkmark"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
