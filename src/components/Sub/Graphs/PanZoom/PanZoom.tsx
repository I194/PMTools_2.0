import {useRef, useState, useEffect, FC, JSXElementConstructor} from 'react';
import {ReactSVGPanZoom, TOOL_NONE, fitSelection, zoomOnViewerCenter, fitToViewer} from 'react-svg-pan-zoom';

const PanZoom: FC = ({ children}) => {
  const Viewer = useRef<any>(null);
  const [tool, setTool] = useState<any>(TOOL_NONE)
  const [value, setValue] = useState<any>({})

  useEffect(() => {
    Viewer.current?.fitToViewer();
  }, []);

  /* Read all the available methods in the documentation */
  const _zoomOnViewerCenter1 = () => Viewer.current.zoomOnViewerCenter(1.1)
  const _fitSelection1 = () => Viewer.current.fitSelection(40, 40, 200, 200)
  const _fitToViewer1 = () => Viewer.current.fitToViewer()

  // /* keep attention! handling the state in the following way doesn't fire onZoom and onPam hooks */
  // const _zoomOnViewerCenter2 = () => setValue(zoomOnViewerCenter(value, 1.1))
  // const _fitSelection2 = () => setValue(fitSelection(value, 40, 40, 200, 200))
  // const _fitToViewer2 = () => setValue(fitToViewer(value))

  return (
    <div>
      <h1>ReactSVGPanZoom</h1>
      <hr/>

      <button className="btn" onClick={() => _zoomOnViewerCenter1()}>Zoom on center (mode 1)</button>
      <button className="btn" onClick={() => _fitSelection1()}>Zoom area 200x200 (mode 1)</button>
      <button className="btn" onClick={() => _fitToViewer1()}>Fit (mode 1)</button>
      <hr/>

      {/* <button className="btn" onClick={() => _zoomOnViewerCenter2()}>Zoom on center (mode 2)</button>
      <button className="btn" onClick={() => _fitSelection2()}>Zoom area 200x200 (mode 2)</button>
      <button className="btn" onClick={() => _fitToViewer2()}>Fit (mode 2)</button> */}
      <hr/>

      <ReactSVGPanZoom
        ref={Viewer}
        width={500} height={500}
        tool={tool} onChangeTool={setTool}
        value={value} onChangeValue={setValue}
        onZoom={e => console.log('zoom')}
        onPan={e => console.log('pan')}
        onClick={event => console.log('click', event.x, event.y, event.originalEvent)}
      >
       {children as any}
      </ReactSVGPanZoom>
    </div>
  )
}

export default PanZoom;