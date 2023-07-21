import React, {createElement as e, useState} from 'react';
import {Zoomed_lambert_graph} from "./zoomed_lambert_graph";
import {Rotate_sphere} from "./rotate_sphere";
import "./style.css";
import {
    GeoVdek,
    getRandomfloat,
    NormalizeV,
    RotateAroundV,
    angle_between_v,
    PlotCircle,
    make_coords,
    get_perp,
    centering,
    poly_contour,
    zone_square,
    convexHull,
    convertToLambert,
    fisherStat,
    lambertMass,
    points_dist_2d,
    getRandomInt
    } from "./gag_functions";



export function Khokhlov_Gvozdik() {

    //-----------------------------------------------------------
    // input data generating
    //-----------------------------------------------------------


    const [selectedD, setSelectedD] = useState<number>(10);
    const handleDChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const number = parseInt(event.target.value);
        setSelectedD(number);
    };
    var d = selectedD;

    const [selectedP, setSelectedP] = useState<number>(990);
    const handlePChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const number = parseInt(event.target.value);
        setSelectedP(number);
    };
    var p = selectedP;

    const [selectedAPC, setSelectedAPC] = useState<number>(0);
    const handleAPCChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const number = parseInt(event.target.value);
        setSelectedAPC(number);
    };
    var apc = selectedAPC;




    var quantiles = [9.9, 8.1, 7.1, 6.4, 5.9, 5.5, 5.2, 4.9, 4.6, 4.4, 4.3, 4.1, 4.0, 3.8];

    if (d == 10) {
        if (apc == 0){
            if (p == 950){
                quantiles = [9.9, 8.1, 7.1, 6.4, 5.9, 5.5, 5.2, 4.9, 4.6, 4.4, 4.3, 4.1, 4.0, 3.8];
            }
            if (p == 975){
                quantiles = [11.0, 9.1, 7.9, 7.1, 6.6, 6.1, 5.8, 5.4, 5.2, 5.0, 4.8, 4.6, 4.4, 4.3];
            }
            if (p == 990){
                quantiles = [12.3, 10.1, 8.9, 8.0, 7.4, 6.8, 6.4, 6.1, 5.8, 5.5, 5.3, 5.1, 4.9, 4.8];
            }
            if (p == 995){
                quantiles = [8.6, 7.9, 7.4, 6.9, 6.5,6.2, 5.9];
            }
            if (p == 997){
                quantiles = [9.0, 8.3, 7.7, 7.2, 6.8, 6.5, 6.2];
            }
        }
        if (apc == 1){
            if (p == 950){
                quantiles = [8.4, 7.3, 6.6, 6.0, 5.6, 5.3, 5.0, 4.8, 4.5, 4.3, 4.2, 4.0, 3.9, 3.8];
            }
            if (p == 975){
                quantiles = [9.3, 8.1, 7.3, 6.7, 6.3, 5.9, 5.6, 5.3, 5.0, 4.8, 4.6, 4.5, 4.3, 4.2];
            }
            if (p == 990){
                quantiles = [10.4, 9.1, 8.2, 7.5, 7.0, 6.6, 6.2, 5.9, 5.6, 5.4, 5.2, 5.0, 4.8, 4.7];
            }
            if (p == 995){
                quantiles = [8.1, 7.5, 7.0, 6.6, 6.3, 6.0, 5.8];
            }
            if (p == 997){
                quantiles = [8.4, 7.9, 7.4, 7.0, 6.6, 6.3, 6.1];
            }
        }
    }
    else {
        if (apc == 0){
            if (p == 950){
                quantiles = [20.1, 16.4, 14.3, 12.9, 11.8, 11.0, 10.4, 9.8, 9.3, 8.9, 8.6, 8.2, 7.9, 7.7];
            }
            if (p == 975){
                quantiles = [22.1, 18.2, 15.9, 14.3, 13.1, 12.3, 11.5, 10.9, 10.4, 9.9, 9.5, 9.2, 8.8, 8.6];
            }
            if (p == 990){
                quantiles = [24.7, 20.4, 17.8, 16.0, 14.7, 13.7, 12.9, 12.2, 11.6, 11.1, 10.6, 10.2, 9.9, 9.6];
            }
            if (p == 995){
                quantiles = [17.3, 15.8, 14.8, 13.8, 13.1, 12.5, 11.9];
            }
            if (p == 997){
                quantiles = [18.1, 16.6, 15.5, 14.5, 13.7, 13.1, 12.5];
            }
        }
        if (apc == 1){
            if (p == 950){
                quantiles = [16.9, 14.7, 13.2, 12.1, 11.2, 10.5, 10.0, 9.5, 9.1, 8.7, 8.4, 8.1, 7.8, 7.5];
            }
            if (p == 975){
                quantiles = [18.6, 16.3, 14.7, 13.5, 12.5, 11.7, 11.1, 10.5, 10.1, 9.7, 9.3, 9.0, 8.7, 8.4];
            }
            if (p == 990){
                quantiles = [20.8, 18.2, 16.4, 15.0, 14.0, 13.1, 12.4, 11.8, 11.2, 10.8, 10.4, 10.0, 9.7, 9.4];
            }
            if (p == 995){
                quantiles = [16.2, 15.0, 14.1, 13.3, 12.7, 12.1, 11.6];
            }
            if (p == 997){
                quantiles = [17.0, 15.7, 14.8, 14.0, 13.3, 12.7, 12.2];
            }
        }
    }


    var max_lon = 0;
    var min_lon = 10;
    var max_lat = 0;
    var min_lat = 10;
    var step = 0;
    var step_list: number[] = [];

    var dir_number = getRandomInt(4, 8);

    const [randomNumbers, setRandomNumbers] = useState<number[]>([]);

    const generateRandomNumbers = () => {
        var random_list = [];

        for (var i = 0; i < dir_number; i++)
        {
            random_list.push(getRandomfloat(min_lat, max_lat));
            random_list.push(getRandomfloat(min_lon, max_lon));
        }
        setRandomNumbers(random_list);
    };

    const savedNumbers = randomNumbers;


    var paleo_data_list: number[][] = [];
    for (var i = 0; i < dir_number; i++)
    {
        paleo_data_list.push(GeoVdek(1, savedNumbers[i * 2], savedNumbers[i * 2 + 1]));
    }

    var dir_list = [];
    var angle_list = [];
    var random_dir = NormalizeV( [ getRandomfloat(0, 1), getRandomfloat(0, 1), getRandomfloat(0, 1) ] );
    var random_angle = getRandomfloat(0, 180);

    for ( var i = 0; i < dir_number; i ++ ) {

        paleo_data_list[i] = RotateAroundV(paleo_data_list[i], random_dir, random_angle);

        // this lists will use later
        dir_list.push(NormalizeV(paleo_data_list[i]));


        step = getRandomInt(3, quantiles.length);
        angle_list.push(quantiles[step]);
        step_list.push(step);
    }


    //-----------------------------------------------------------------------
    //
    //-----------------------------------------------------------------------
    type TableRow = {
        id: number;
        randomInt: number;
        randomFloats: number[];
    };
    // Генерация данных для таблицы
    const generateTableData = (): TableRow[] => {
        const randomRows = dir_number; // Случайное количество строк от 4 до 8
        const tableData: TableRow[] = [];

        for (let i = 1; i <= randomRows; i++) {

            // Случайное целое число от 3 до 8
            const randomInt = step_list[i];

            // Три случайных дробных числа от 0 до 1
            const randomFloats = Array.from({ length: 3 }, () => getRandomfloat(0, 1));
            tableData.push({
                id: i,
                randomInt,
                randomFloats,
            });
        }
        return tableData;
    }

    const tableData = generateTableData();




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


    const [selectedNumber, setSelectedNumber] = useState<number>(100000);

    const handleNumberChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const number = parseInt(event.target.value);
        setSelectedNumber(number);
    };
    const outsideVariable = selectedNumber;
    var points_numb = outsideVariable;

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

    var rot_center_zone = convertToLambert(center_zone, sred_dir);
    var calc_circ_points = 720 * 8;
    var input: [number, number][] = [];
    var circ_p = [];

    for ( var i = 0; i < dir_list.length; i ++ )
    {
        var b = lambertMass(PlotCircle(dir_list[i], angle_list[i], calc_circ_points), sred_dir);

        for (var j = 0; j < b.length; j++){
            circ_p.push(b[j]);
        }
    }

    for ( let i = 0; i < circ_p.length; i ++ )
    {
        input.push([circ_p[i][0], circ_p[i][1]]);
    }

    var poly_points2d = poly_contour(input, [rot_center_zone[0], rot_center_zone[1]]);
    var poly_points3d = [];

    for ( let i = 0; i < poly_points2d.length; i ++ )
    {
        poly_points3d.push([poly_points2d[i][0], poly_points2d[i][1], 1 ]);
    }

    const polygonPoints = make_coords(poly_points3d);

    var max_rad = -1;
    for ( let i = 0; i < input.length; i ++ )
    {
        if (points_dist_2d(rot_center_zone, input[i]) > max_rad){max_rad = points_dist_2d(rot_center_zone, input[i]);}
    }

    //---------------------------------------------------------------------------------------
    // Interface
    //---------------------------------------------------------------------------------------


  const [isvis, setIsVisible] = useState(true);
  const handleCheckboxChange = () => {
    setIsVisible(!isvis);
  };

  const [isvisgrid, setisvisgrid] = useState(false);
  const gridCheckboxChange = () => {
    setisvisgrid(!isvisgrid);
  };

    var my_props = {
        center_zone: center_zone,
        dir_list: dir_list,
        grid_points: grid_points,
        angle_list: angle_list,
        sred_dir: sred_dir
    };

    var lambert_zoom_props = {
        center_zone: center_zone,
        dir_list: dir_list,
        angle_list: angle_list,
        grid_points: grid_points,
        points_numb: points_numb,
        sred_dir: sred_dir,
        alpha95: alpha95,
        isvis: isvis,
        isvisgrid: isvisgrid,
        polygonPoints: polygonPoints
    };

    return (
    <div>
        <div className="container">
            <Zoomed_lambert_graph
                center_zone={center_zone}
                dir_list={dir_list}
                angle_list={angle_list}
                grid_points={grid_points}
                points_numb={points_numb}
                sred_dir={sred_dir}
                alpha95={alpha95}
                isvis={isvis}
                isvisgrid={isvisgrid}
                polygonPoints={polygonPoints}
            />

            <Rotate_sphere
                center_zone={center_zone}
                dir_list={dir_list}
                angle_list={angle_list}/>
        </div>

        <div className="container">
            <h5 className="my_text">Interface</h5>
            <div className="interface">
                <select value={selectedNumber} onChange={handleNumberChange}>
                    <option value={50000}>50 000</option>
                    <option value={100000}>100 000</option>
                    <option value={250000}>250 000</option>
                    <option value={500000}>500 000</option>
                    <option value={1000000}>1 000 000</option>
                    <option value={1500000}>1 500 000</option>
                    <option value={2000000}>2 000 000</option>
                    <option value={2500000}>2 500 000</option>
                    <option value={3000000}>3 000 000</option>
                    <option value={3500000}>3 500 000</option>
                </select>
                <br/>

                <select value={selectedD} onChange={handleDChange}>
                    <option value={10}>d = 10</option>
                    <option value={5}>d = 5</option>
                </select>
                <br/>

                <select value={selectedP} onChange={handlePChange}>
                    <option value={950}>0.950</option>
                    <option value={975}>0.975</option>
                    <option value={990}>0.99</option>
                    <option value={995}>0.995</option>
                    <option value={997}>0.997</option>
                </select>
                <br/>

                <select value={selectedAPC} onChange={handleAPCChange}>
                    <option value={1}>aPC</option>
                    <option value={0}>PC</option>
                </select>

                <br/>
                <button className="button" onClick={generateRandomNumbers}>Generate Random Numbers</button>
                <br/>

                <label className="my_input">Zone painting
                    <input type="checkbox" checked={isvis} onChange={handleCheckboxChange}/>
                    <span className="checkmark"></span>
                </label>

                <label className="my_input">Grid painting
                    <input type="checkbox" checked={isvisgrid} onChange={gridCheckboxChange}/>
                    <span className="checkmark"></span>
                </label>

                <b>The percentage of the zone from the sphere:</b>
                {" " + String((zone_square(grid_points.length, points_numb) * 100).toFixed(3))}%.
                <br/>
                <b>Maxium radius of the zone: </b>{max_rad.toFixed(3)}
                <br/>
                <b>&#945;95: </b>{alpha95.toFixed(3)}




                <table>

                    <caption>Data view</caption>

                    <tr>
                        <th>Number</th>
                        <th>Steps</th>
                        <th>Coordinates</th>
                    </tr>

                    {tableData.map(({ id, randomInt, randomFloats }) => (
                    <tr key={id}>
                        <td>{id}</td>
                        <td>{randomInt}</td>
                        <td>{randomFloats.join(', ')}</td>
                    </tr>
                    ))}


                </table>




            </div>
        </div>
    </div>
    );
}


