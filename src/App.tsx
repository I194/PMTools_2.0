import React, {createElement as e, useState} from 'react';
import "./style.css";
// import {My_interface} from "./gag_components/my_input";
import {zoomed_graph} from "./gag_components/zoomed_graph";
import {zoomed_lambert_graph} from "./gag_components/zoomed_lambert_graph";
import {rotate_sphere} from "./gag_components/rotate_sphere";
import {default_sphere} from "./gag_components/default_sphere";
// import {ButtonCounter} from "./gag_components/my_input";
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
    zone_square
        } from "./gag_components/gag_functions";


function App() {

    return (
    <div>
        <My_interface />
    </div>
    );
//     return e('div', {className: 'container', display: "flex"},
//                 [
//                     e('h1', {className: 'font-hold', key: 1}, `Test jsx ${count}`),
//
//
//                     e('button', {className: 'btn', key: 4443245, onClick: () => setCount(count + 1), display: "inline-block"}, 'reload'),
//                     e('my_output', {key: 576767777666, firstName: 'ggg', lastname: 'gfdgffg'}, 'enter your data ...'),
//
//
//
//
//
//                 ]
//             );


}
export default App;

