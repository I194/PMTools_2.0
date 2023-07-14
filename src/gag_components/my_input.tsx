import React, {createElement as e, useState} from 'react';
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
    } from "./gag_functions";


export const My_interface: React.FC = () => {
      const [count, setCount] = useState(0);

      const handleClick = () => {
        setCount(count + 1);
      };
// export function My_interface() {

    //-----------------------------------------------------------------
    // Interface
    //-----------------------------------------------------------------
//     const my_output = ({ firstName, lastName }: { firstName: string, lastName: string }) => <div>Hey you! {firstName} {lastName}!</div>;
//     const [count, setCount] = useState(0);




      return (
        <div>
          <h5 className="my_text">Interface</h5>
          <br/><br/><br/><br/>
          <button onClick={handleClick}>Нажми на меня</button>
          <p>Количество нажатий: {count}</p>
        </div>
      );
    };

//     return (
//         <div>
//
//         <h1>`Test jsx ${count}`</h1>
//         <button onClick=setCount(count + 1)>reload</button>
//
//         </div>
//     )
// }


//                     e('h1', {className: 'font-hold', key: 1}, `Test jsx ${count}`),
//
//
//                     e('button', {className: 'btn', key: 4443245, onClick: () => setCount(count + 1), display: "inline-block"}, 'reload'),
//                     e('my_output', {key: 576767777666, firstName: 'ggg', lastname: 'gfdgffg'}, 'enter your data ...'),
//