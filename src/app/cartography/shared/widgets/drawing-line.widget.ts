import {DrawingLine} from "../models/drawing-line.model";
import {SVGSelection} from "../../../map/models/types";
import {Point} from "../models/point.model";
import {line} from "d3-shape";
import {event, mouse, select} from "d3-selection";

export class DrawingLineWidget {
  private drawingLine: DrawingLine = new DrawingLine();
  private selection: SVGSelection;

  public start(x: number, y: number) {
    const self = this;

    console.log("Start", x, y);
    this.drawingLine.start = new Point(x, y);
    this.drawingLine.end = new Point(x, y);

    const over = function(this, d, i) {
      // const e = event;
      // const dom = select('g.canvas').node();
      const node = self.selection.select<SVGGElement>('g.canvas').node();
      const coordinates = mouse(node);
      // console.log(e);
      console.log(d, i);
      self.drawingLine.end.x = coordinates[0];
      self.drawingLine.end.y = coordinates[1];
      self.draw();
    };

    this.selection.on('mousemove', over);
    this.draw();
  }

  // private handleMouseOver(d, i) {
  //   const e = event;
  //   console.log(e);
  //   console.log(d, i);
  //   this.drawingLine.end.x = e.clientX;
  //   this.drawingLine.end.y = e.clientY;
  //   this.draw();
  // }

  public update(x: number, y: number) {
    this.drawingLine.end = new Point(x, y);
  }

  public stop() {

  }

  public connect(selection: SVGSelection) {
    this.selection = selection;
    // this.selection.append<SVGGElement>('g').classed("drawing-line-tool");
  }

  public draw() {
    const link_data = [[
      [this.drawingLine.start.x, this.drawingLine.start.y],
      [this.drawingLine.end.x, this.drawingLine.end.y]
    ]];

    const value_line = line();

    // const canvas = this.selection.select<SVGGElement>('g.drawing-line-tool');
    //
    // const tool = canvas
    //     .selectAll<SVGPathElement, DrawingLine>('path')
    //     .data(link_data);
    //
    // const enter = tool
    //   .enter()
    //     // .append<SVGPathElement>('g.drawing-line')
    //       .append<SVGPathElement>('path')
    //
    // // enter.classed("drawing-line");
    //
    //
    // tool
    //   .merge(enter)
    //     .attr('d', value_line)
    //     .attr('stroke', '#000')
    //     .attr('stroke-width', '2');

    const tool = this.selection
        .selectAll<SVGGElement, DrawingLine>('path')
        .data(link_data);

    const enter = tool
      .enter()
        .append<SVGPathElement>('path');

    tool
      .merge(enter)
        .attr('d', value_line)
        .attr('stroke', '#000')
        .attr('stroke-width', '2');

    // const tool = this.selection
    //     .selectAll<SVGGElement, DrawingLine>('g.drawing-line')
    //     .data(link_data);
    //
    // const enter = tool
    //   .enter()
    //     .append<SVGGElement>('g.drawing-line')
    //       .append<SVGPathElement>('path');
    //
    // tool
    //   .merge(enter)
    //     .select<SVGPathElement>('path')
    //       .attr('d', value_line)
    //       .attr('stroke', '#000')
    //       .attr('stroke-width', '2');


  }
}