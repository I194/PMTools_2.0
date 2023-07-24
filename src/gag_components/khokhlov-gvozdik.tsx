import React, {createElement as e, useEffect, useState} from 'react';
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
    getRandomInt,
    get_quantiles
    } from "./gag_functions";



export function Khokhlov_Gvozdik() {

    //-----------------------------------------------------------
    // input data generating
    //-----------------------------------------------------------

    var max_lon = 0;
    var min_lon = 10;
    var max_lat = 0;
    var min_lat = 10;

    // Ваня. проблема в участке кода с 40 по 150 строку. есть кнопка, три тега select(их 4, но первый обособлен и работает нормально) и строчка, которая выводится на экран.
    // теги select задают значения радиусов кругов, при их переключении должны меняться радиусы кругов, записанные в переменную quantiles,
    // первые значения quantiles выводятся на экран в виде строчки quantiles=___12.3___... эта строка должна меняться каждый
    // раз, когда один из этих трех selectов переключаются, но этого не происходит при первом переключении любого select.
    // при повторном переключении тега select, quantiles меняются на те значения, которые должны были высветиться при предыдущем переключении тега.
    // Ваня. эти хуки работают корректно. 
    // Ваня. массив с количеством шагов размагничивания, случайное количество
    const [step_list, setStepList] = useState<number[]>([]);
    // Ваня. массив с направлениями == координаты центров кругов, случайные направления, расположенные примерно рядом
    const [dir_list, setDirList] = useState<[number, number, number][]>([]);
    // Ваня. количество генерируемых образцов, случайное число
    const [dir_number, setDirNumb] = useState<number>(0);

    // Ваня. c этими хуками возникают проблемы.
    // Ваня. эти три значения задаются выбором в тегах select, и на их основе задается массив quantiles
    const [apc, setSelectedAPC] = useState<number>(0);
    const [selectedP, setSelectedP] = useState<number>(990);
    const [selectedD, setSelectedD] = useState<number>(10);
    
    // Ваня. это массивы с радиусами кругов. quantiles - таблицные значения, получаемые из функции первые 5 значений выводятся на экран 
    const [quantiles, setQuantiles] = useState<number[]>([12.3, 10.1, 8.9, 8.0, 7.4, 6.8, 6.4, 6.1, 5.8, 5.5, 5.3, 5.1, 4.9, 4.8]);
    // angle_list - массив с углами для каждого образца, рассчитывается из quantiles и step_list.
	const [angle_list, setAngleList] = useState<number[]>([]);

    // сеттеры в React работают асинхронно, вот тут детали работы указаны https://react.dev/reference/react/useState#setstate-caveats
    // из-за этого поведения, когда ты пытался вызвать setQuantiles и setAngleList внутри handleDChange и других хэндлеров, у тебя еще не 
    // успевало обновиться состояние setSelectedD (аналогичное с двумя другими сеттерами) и потому ты наблюдал такое поведение
    // useEffect как раз придуман для реагирования на асинхронные изменения в коде*
    // *все что я тут написал может быть совсем иначе написано в документации и где либо в сети, это просто моё виденье всего этого процесса
    useEffect(() => {
        var quantiles = get_quantiles(selectedD, apc, selectedP);
        setQuantiles(quantiles);
    
        var new_ang_list = [];
        for ( var i = 0; i < dir_number; i ++ ) {
            new_ang_list.push(quantiles[step_list[i]]);
        }
        setAngleList(new_ang_list);
    }, [selectedD, apc, selectedP, dir_number, step_list]);

    // Ваня. это select который выбирает параметр d = 10 или 5, для расчета quantiles и angle_list. 
    //  он должен при изменении менять quantiles и angle_list, и на экране менять строчку quantiles=___12.3___...
    const handleDChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const number = parseInt(event.target.value);
        setSelectedD(number);
    };


    // Ваня. это select который выбирает параметр на 0.99/0.975/0.997..., для расчета quantiles и angle_list. 
    //  он должен при изменении менять quantiles и angle_list, и на экране менять строчку quantiles=___12.3___...
    const handlePChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const number = parseInt(event.target.value);
        setSelectedP(number);
    };


    // Ваня. это select который выбирает параметр на aPC/PC, для расчета quantiles и angle_list. 
    //  он должен при изменении менять quantiles и angle_list, и на экране менять строчку quantiles=___12.3___...
    const handleAPCChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const number = parseInt(event.target.value);
        setSelectedAPC(number);
    };


    // Ваня. это кнопка, которая генерирует направления(dir_list), число образцов(dir_number), 
    // количество шагов размагничивания в образцах(step_list) и рассчитывает из quantiles - angle_list
    // она не меняет quantiles!! она просто генерирует данные, и раздает образцам 
    // радиусы их кругов на основе quantiles.
    const generateRandomNumbers = () => {
        var random_list = [];
        var dir_number = getRandomInt(3, 9 + 1);

        for (var i = 0; i < dir_number; i++)
        {
            random_list.push(getRandomfloat(min_lat, max_lat));
            random_list.push(getRandomfloat(min_lon, max_lon));
        }

        var dir_list: [number, number, number][] = [];
        var angle_list = [];
        var step_list = [];
        var paleo_data: number[];
        var step = 0;

        var random_dir = NormalizeV( [ getRandomfloat(0, 1), getRandomfloat(0, 1), getRandomfloat(0, 1) ] );
        var random_angle = getRandomfloat(0, 180);

        for ( var i = 0; i < dir_number; i ++ ) {

            paleo_data = GeoVdek(1, random_list[i * 2], random_list[i * 2 + 1])
            paleo_data = NormalizeV(RotateAroundV(paleo_data, random_dir, random_angle));
            step = getRandomInt(6, quantiles.length);

            angle_list.push(quantiles[step]);
            step_list.push(step + 3);

            dir_list.push([paleo_data[0], paleo_data[1], paleo_data[2]]);
        }
        
        setDirList(dir_list);
        setStepList(step_list);
        setDirNumb(dir_number);
        setAngleList(angle_list);
    };

    //-----------------------------------------------------------------------
    // Ваня. Дальше все работает корректно
    //-----------------------------------------------------------------------

    const [isvis, setIsVisible] = useState(true);
    const handleCheckboxChange = () => {
        setIsVisible(!isvis);
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



    //-----------------------------------------------------------------------
    //
    //-----------------------------------------------------------------------

   var table_data = [];

   for (var i = 0; i < dir_number; i++) {
        table_data.push(
            {
                id: i + 1,
                step_numb: step_list[i],
                angles: angle_list[i],
                dir_coords: String(dir_list[i][0]) + "\n" + String(dir_list[i][1]) + "\n" + String(dir_list[i][2]) + "\n"
            }
        );
    }

   let res = table_data.map(function(item) {
      return <tr key={item.id}>
         <td>{item.id}</td>
         <td>{item.step_numb}</td>
         <td>{item.angles}</td>
         <td className="coords">{item.dir_coords}</td>
      </tr>;
   });

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


                <select value={apc} onChange={handleAPCChange}>
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

                <br/>
                <b>quantiles = </b>
                {"____"}{quantiles[0]}
                {"____"}{quantiles[1]}
                {"____"}{quantiles[2]}
                {"____"}{quantiles[3]}
                {"____"}{quantiles[4]}{"_______"}

            </div>

            <h5 className="my_text">Data view</h5>
            <div className="my_scroll scrollable-table">

                <table>
                    <thead>
                        <tr>
                            <td className="table_head">id</td>
                            <td className="table_head">Step</td>
                            <td className="table_head">Angle</td>
                            <td className="table_head">Dir</td>
                        </tr>
                    </thead>
                    <tbody>
                        {res}
                    </tbody>
                </table>



            </div>




        </div>
    </div>
    );
}


