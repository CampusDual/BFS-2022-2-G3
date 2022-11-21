import { Component, OnInit } from '@angular/core';
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { PublicationService } from 'src/app/services/publication.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ThisReceiver } from '@angular/compiler';


@Component({
  //selector: 'app-graphic',
  templateUrl: './graphic.component.html',
  styleUrls: ['./graphic.component.scss']
})
export class GraphicComponent implements OnInit {

  graphicForm: FormGroup;
  dataChart: Object[];
  data: Map<String, Object>[];


  constructor(
    private publicationService: PublicationService,
    private fb: FormBuilder
  ) {
    this.graphicForm = this.fb.group({
      iniDate: [''],
      endDate: ['']
    })
  }

  ngOnInit(): void {

    let iniDate: Date = new Date('2022-11-16');
    let endDate: Date = new Date('2023-12-31');

    this.publicationService.getDataChart(iniDate, endDate).subscribe((response) => {
      this.data = response
      this.drawGraphic();
    });

  }

  drawGraphic() {

    let root = am5.Root.new("chartdiv");
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout
    }));


    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));

    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "province",
      renderer: am5xy.AxisRendererX.new(root, {}),
      tooltip: am5.Tooltip.new(root, {})
    }));

    xAxis.data.setAll(this.data);

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      min: 0,
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    let legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50
    }));


    function makeSeries(name, fieldName, data) {
      let series = chart.series.push(am5xy.ColumnSeries.new(root, {
        name: name,
        stacked: true,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: fieldName,
        categoryXField: "province"
      }));

      series.columns.template.setAll({
        tooltipText: "{name}, {categoryX}: {valueY}",
        tooltipY: am5.percent(10)
      });
      series.data.setAll(data);

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            text: "{valueY}",
            fill: root.interfaceColors.get("alternativeText"),
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true
          })
        });
      });

      legend.data.push(series);
    }

    makeSeries("Deportes", "Deportes", this.data);
    makeSeries("Gastronomía", "Gastronomía", this.data);
    makeSeries("Ocio", "Ocio", this.data);
    makeSeries("Juegos", "Juegos", this.data);
    makeSeries("Naturaleza", "Naturaleza", this.data);
    makeSeries("Viajes", "Viajes", this.data);
    makeSeries("Otros", "Otros", this.data);

    chart.appear(1000, 100);

  }

  filter() {
    this.publicationService.getDataChart(this.graphicForm.value.iniDate, this.graphicForm.value.endDate).subscribe((response) => {
    this.data = response
    this.drawGraphic();
    });

  }

}
