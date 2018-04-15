import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.severityLevels = {};
    this.severityLevels[instanceSettings.jsonData.severity.critical.toLowerCase()] = 3;
    this.severityLevels[instanceSettings.jsonData.severity.warning.toLowerCase()]  = 2;
    this.severityLevels[instanceSettings.jsonData.severity.info.toLowerCase()]     = 1;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
  }

  query(options) {
    var query = this.buildQueryParameters(options);
    query.targets = query.targets.filter(t => !t.hide);

    if (query.targets.length <= 0) {
      return this.q.when({data: []});
    }
    // Format data for table panel
    if(query.targets[0].type === "table"){
      let filter = encodeURIComponent(this.templateSrv.replace(query.targets[0].expr, options.scopedVars) || "");
      return this.backendSrv.datasourceRequest({
        url: this.url + '/api/v1/alerts?silenced=false&inhibited=false&filter='+filter,
        data: query,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(response => {
          let results = {
              "data": [{
                  "rows": [],
                  "columns": [],
                  "type": "table"
              }]
          };

          if(response.data && response.data.data && response.data.data.length) {
              let severity = response.data.data[0].labels.severity;
              delete response.data.data[0].labels.severity;
              results.data[0].columns = this.getColumns(response.data.data[0]);
              //console.log('here');
              for (let i = 0; i < response.data.data.length; i++) {
                  //console.log('here' + i);

                  let item = response.data.data[i];
                  delete item.labels.severity;
                  let labelValues = Object.values(item.labels);
                  let annotationValues = Object.values(item.annotations);
                  let row = [Date.parse(item.startsAt)].concat(labelValues).concat(annotationValues);
                  row.push([this.severityLevels[severity]]);
                  results.data[0].rows.push(row);
              }
          }
          //console.log(JSON.stringify(results));
          return results;
      });
    }else{
      let filter = encodeURIComponent(this.templateSrv.replace(query.targets[0].expr, options.scopedVars) || "");
      return this.backendSrv.datasourceRequest({
        url: this.url + '/api/v1/alerts?silenced=false&inhibited=false&filter='+filter,
        data: query,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(response => {
        return {
          "data": [
            {
              "datapoints": [
                [response.data.data.length, Date.now()]
              ]
            }
          ]
        }
      });
    }
  }

    getColumns(dataRow) {
        let columns =  [{ text: "Time", type: "time" }];
        for(let label of Object.keys(dataRow.labels)) {
            columns.push({ text: label, type: "string" })
        }
        for(let annotation of Object.keys(dataRow['annotations'])) {
            columns.push({ text: annotation, type: "string" })
        }
        columns.push({ text: "severity", type: "string" });
        return columns;
    }

  testDatasource() {
    return this.backendSrv.datasourceRequest({
      url: this.url + '/api/v1/status',
      method: 'GET'
    }).then(response => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    });
  }

  buildQueryParameters(options) {
    //remove placeholder targets
      options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });
      options.targetss = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(target.target),
        expr: target.expr,
        refId: target.refId,
        hide: target.hide,
        type: target.type || 'single',
        legendFormat: target.legendFormat || ""
      };
    });
    return options;
  }

  formatInstanceText(labels, legendFormat){
    if(legendFormat === ""){
      return JSON.stringify(labels);
    }
    let aliasRegex = /\{\{\s*(.+?)\s*\}\}/g;
    return legendFormat.replace(aliasRegex, function(match, g1) {
      if (labels[g1]) {
        return labels[g1];
      }
      return "";
    });
  }
}
