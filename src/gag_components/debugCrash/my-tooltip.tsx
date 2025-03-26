import React, {createElement as e, useEffect, useState} from 'react';
// import "./style.css";
// import {Rotate_sphere} from "./rotate_sphere";


  export function TooltipContent(tooltip_props:{type:string, sred_dir: number[], center_zone: number[], dir_list: number[][], angle_list: number[]}) {

    var type = tooltip_props.type;

    let center_zone = tooltip_props.center_zone;
    let dir_list = tooltip_props.dir_list;
    let angle_list = tooltip_props.angle_list;
    let sred_dir = tooltip_props.sred_dir

    let content = '';
    if (type === 'graph') {
        return (
            <span className='tooltip-span'>
                Этот график представляет собой результат проецирования на 
                плоскость изображения, построенного на поверхности сферы.
                Красный круг - это доверительный интервал а95. Черные круги 
                построены вокруг направления, получанного из одного образца.
                Радиус черных кругов отображает качество соответствующих 
                образцов и представляет собой доверительный интервал. Чем 
                больше шагов размагничивания было пройдено образцом, тем 
                меньше круг.
                
                <hr className='tooltip-span'></hr>
                Пересечение кругов образует  синеватую зону, в которой лежит 
                истинное палеомагнитное направление, закраску этой зоны можно 
                убрать нажав на галочку show zone Точность расчета центра 
                этой зоны зависит от плотности grid, которую можно настроить 
                на панели параметров, также сам grid можно отобразить, нажав
                на галочку show grid. При достаточной точности, центр
                будет находиться ровно в гипоцентре зоны.

            </span>
        );
    } 
    
    else if (type === 'checkbox') {
        return (
            <span>my checkbox</span>
        );
    } 

    else if (type === 'select') {
        return (
            <span>my select</span>
        );
    }

    else if (type === 'download svg') {
        return (
            <span>download svg</span>
        );
    }
    
    else {
        return <span></span>;
    }
    
  };
