import { select } from "d3-selection";

import { Widget } from "./widget";
import { SVGSelection } from "../models/types";
import { Link } from "../models/link";
import { LinkStatus } from "../models/link-status";
import { MultiLinkCalculatorHelper } from "../components/map/helpers/multi-link-calculator-helper";
import { SerialLinkWidget } from "./serial-link";
import { EthernetLinkWidget } from "./ethernet-link";
import { Layer } from "../models/layer";
import { InterfaceLabelWidget } from "./interface-label";


export class LinksWidget implements Widget {
  private multiLinkCalculatorHelper = new MultiLinkCalculatorHelper();

  private interfaceLabelWidget: InterfaceLabelWidget;

  constructor() {
    this.interfaceLabelWidget = new InterfaceLabelWidget();
  }

  public getInterfaceLabelWidget() {
    return this.interfaceLabelWidget;
  }

  public setInterfaceLabelWidget(interfaceLabelWidget: InterfaceLabelWidget) {
    this.interfaceLabelWidget = interfaceLabelWidget;
  }

  public getLinkWidget(link: Link) {
    if (link.link_type === 'serial') {
      return new SerialLinkWidget();
    }
    return new EthernetLinkWidget();
  }

  public select(view: SVGSelection) {
    return view.selectAll<SVGGElement, Link>("g.link");
  }

  public revise(selection: SVGSelection) {
    const self = this;

    selection
      .each(function (this: SVGGElement, l: Link) {
        const link_group = select<SVGGElement, Link>(this);
        const link_widget = self.getLinkWidget(l);

        link_widget.draw(link_group, l);

        const link_path = link_group.select<SVGPathElement>('path');

        const start_point: SVGPoint = link_path.node().getPointAtLength(45);
        const end_point: SVGPoint = link_path.node().getPointAtLength(link_path.node().getTotalLength() - 45);

        let statuses = [];

        if (link_path.node().getTotalLength() > 2 * 45 + 10) {
          statuses = [
            new LinkStatus(start_point.x, start_point.y, l.source.status),
            new LinkStatus(end_point.x, end_point.y, l.target.status)
          ];
        }

        const status_started = link_group
          .selectAll<SVGCircleElement, LinkStatus>('circle.status_started')
          .data(statuses.filter((link_status: LinkStatus) => link_status.status === 'started'));

        const status_started_enter = status_started
          .enter()
            .append<SVGCircleElement>('circle');

        status_started
          .merge(status_started_enter)
            .attr('class', 'status_started')
            .attr('cx', (ls: LinkStatus) => ls.x)
            .attr('cy', (ls: LinkStatus) => ls.y)
            .attr('r', 6)
            .attr('fill', '#2ecc71');

        status_started
          .exit()
            .remove();

        const status_stopped = link_group
          .selectAll<SVGRectElement, LinkStatus>('rect.status_stopped')
          .data(statuses.filter((link_status: LinkStatus) => link_status.status === 'stopped'));

        const status_stopped_enter = status_stopped
          .enter()
            .append<SVGRectElement>('rect');

        const STOPPED_STATUS_RECT_WIDTH = 10;

        status_stopped
          .merge(status_stopped_enter)
            .attr('class', 'status_stopped')
            .attr('x', (ls: LinkStatus) => ls.x - STOPPED_STATUS_RECT_WIDTH / 2.)
            .attr('y', (ls: LinkStatus) => ls.y - STOPPED_STATUS_RECT_WIDTH / 2.)
            .attr('width', STOPPED_STATUS_RECT_WIDTH)
            .attr('height', STOPPED_STATUS_RECT_WIDTH)
            .attr('fill', 'red');

        status_stopped
          .exit()
            .remove();

      })
      .attr('transform', function(l) {
        if (l.source && l.target) {
          const translation = self.multiLinkCalculatorHelper.linkTranslation(l.distance, l.source, l.target);
          return `translate (${translation.dx}, ${translation.dy})`;
        }
        return null;
      });

    this.getInterfaceLabelWidget().draw(selection);
  }

  public draw(view: SVGSelection, links?: Link[]) {
    const link = view
      .selectAll<SVGGElement, Link>("g.link")
      .data((layer: Layer) => {
        if (layer.links) {
          const layer_links = layer.links.filter((l: Link) => {
              return l.target && l.source;
          });
          this.multiLinkCalculatorHelper.assignDataToLinks(layer_links);
          return layer_links;
        }
        return [];
      }, (l: Link) => {
        return l.link_id;
      });

    const link_enter = link.enter()
      .append<SVGGElement>('g')
        .attr('class', 'link')
        .attr('link_id', (l: Link) => l.link_id)
        .attr('map-source', (l: Link) => l.source.node_id)
        .attr('map-target', (l: Link) => l.target.node_id);

    const merge = link.merge(link_enter);

    this.revise(merge);


    link
      .exit()
        .remove();
  }

}
