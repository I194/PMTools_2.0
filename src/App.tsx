import React, {createElement as e, useState, Component} from 'react';
import "./style.css";

import {Zoomed_graph} from "./gag_components/zoomed_graph";
import {Zoomed_lambert_graph} from "./gag_components/zoomed_lambert_graph";
import {Rotate_sphere} from "./gag_components/rotate_sphere";
import {Default_sphere} from "./gag_components/default_sphere";
import {My_interface} from  "./gag_components/my_input";
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
    fisherStat,
    getRandomInt
        } from "./gag_components/gag_functions";


function App() {

    //-----------------------------------------------------------
    // input data generating
    //-----------------------------------------------------------


    var cmadlist = [7.69, 3.9, 3.18, 2.88,
                    2.71, 2.63, 2.57, 2.54,
                    2.51, 2.48, 2.46, 2.44,
                    2.43, 2.43];
    var camadlist = [6.0, 5.0, 4.63, 4.43,
                    4.31, 4.24, 4.18, 4.14,
                    4.12, 4.11, 4.08, 4.08,
                    4.06, 4.05];


    var max_lon = 95;
    var min_lon = 91;
    var max_lat = 5;
    var min_lat = 1;


    var dir_number = 4;

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
//     var random_dir = NormalizeV( [12.25332872287876, 0.62710598184995592, 0.7081437582222506] );
//     var random_angle = -38.37150716636394;

    for ( var i = 0; i < dir_number; i ++ ) {

        paleo_data_list[i] = RotateAroundV(paleo_data_list[i], random_dir, random_angle);

        // this lists will use later
        dir_list.push(NormalizeV(paleo_data_list[i]));
        angle_list.push(cmadlist[getRandomInt(2, camadlist.length)]);
    }


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


    const [selectedNumber, setSelectedNumber] = useState<number>(500000);

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

    var my_props = {
        center_zone: center_zone,
        dir_list: dir_list,
        grid_points: grid_points,
        angle_list: angle_list
    };

    var zoom_props = {
        center_zone: center_zone,
        dir_list: dir_list,
        angle_list: angle_list,
        grid_points: grid_points,
        points_numb: points_numb,
        sred_dir: sred_dir,
        alpha95: alpha95
    };
    var lambert_props = {
        center_zone: center_zone,
        dir_list: dir_list,
        angle_list: angle_list,
        grid_points: grid_points,
        points_numb: points_numb,
        sred_dir: sred_dir,
        alpha95: alpha95
    };



//     const my_output = ({ firstName, lastName }: { firstName: string, lastName: string }) => <div>Hey you! {firstName} {lastName}!</div>;
//     const [count, setCount] = useState(0);

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
            />

            <Rotate_sphere
                center_zone={center_zone}
                dir_list={dir_list}
                angle_list={angle_list}/>
        </div>
        <div className="container">
            <Zoomed_graph center_zone={center_zone}
                dir_list={dir_list}
                angle_list={angle_list}
                grid_points={grid_points}
                points_numb={points_numb}
                sred_dir={sred_dir}
                alpha95={alpha95}
            />

            <Default_sphere
                center_zone={center_zone}
                dir_list={dir_list}
                grid_points={grid_points}
                angle_list={angle_list}
                />
        </div>
        <div className="container">
            <My_interface />


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
            <button onClick={generateRandomNumbers}>Generate Random Numbers</button>
            <ul>
                {randomNumbers.map((num, index) => (
                <li key={index}>{num}</li>
                ))}
            </ul>


        </div>

    </div>
    );
}
export default App;

