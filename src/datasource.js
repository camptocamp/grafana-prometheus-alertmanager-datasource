import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.annotations = instanceSettings.annotations;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
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
    if(query.targets[0].type == "table"){
      var filter = encodeURIComponent(this.templateSrv.replace(query.targets[0].expr) || "");
      return this.backendSrv.datasourceRequest({
        url: this.url + '/api/v1/alerts?silenced=false&inhibited=false&filter='+filter,
        data: query,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(response => {
        var results = {
          "data": [
            {
              "columns":[
                {"text": "Time", "type": "time"},
                {"text": "Message", "type": "string"},
                {"text": "Alertname", "type": "string"},
                {"text": "Severity", "type": "string"}
              ],
              "rows": [],
              "type": "table"
            }
          ]
        };
        for(var i=0;i<response.data.data.length;i++){
          var item = response.data.data[i];
          if (query.targets[0].annotations) {
            var text = item.annotations;
          } else {
            var text = item.labels;
          }
          results.data[0].rows.push([
            Date.parse(item.startsAt),
            this.formatInstanceText(text, query.targets[0].legendFormat),
            item.labels.alertname,
            parseInt(item.labels.severity)
          ]);
        };
        return results;
      });
    }else{
      return this.backendSrv.datasourceRequest({
        url: this.url + '/api/v1/alerts?silenced=false&inhibited=false&filter='+encodeURIComponent(query.targets[0].expr || ""),
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
    var targets = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(target.target),
        expr: target.expr,
        refId: target.refId,
        hide: target.hide,
        type: target.type || 'single',
        annotations: target.annotations || false,
        legendFormat: target.legendFormat || ""
      };
    });
    options.targets = targets;
    return options;
  }

  formatInstanceText(labels, legendFormat){
    if(legendFormat == ""){
      return JSON.stringify(labels);
    }
    var aliasRegex = /\{\{\s*(.+?)\s*\}\}/g;
    var text = legendFormat.replace(aliasRegex, function(match, g1) {
      if (labels[g1]) {
        return labels[g1];
      }
      return "";
    });
    return text;
  }
}
