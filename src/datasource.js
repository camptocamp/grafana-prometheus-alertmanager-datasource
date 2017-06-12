import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
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
      return this.backendSrv.datasourceRequest({
        url: this.url + '/api/v1/alerts?filter='+encodeURIComponent(query.targets[0].expr || ""),
        data: query,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(response => {
        var results = {
          "data": [
            {
              "columns":[
                {"text": "Time", "type": "time"},
                {"text": "Instance", "type": "string"},
                {"text": "Alertname", "type": "string"},
                {"text": "Severity", "type": "Number"}
              ],
              "rows": [],
              "type": "table"
            }
          ]
        };
        response.data.data.forEach(function(item){
          results.data[0].rows.push([
            Date.parse(item.startsAt),
            item.labels.instance+" ("+item.labels.rancher_host+")",
            item.labels.alertname,
            1
          ]);
        });
        return results;
      });
    }else{
      return this.backendSrv.datasourceRequest({
        url: this.url + '/api/v1/alerts?filter='+encodeURIComponent(query.targets[0].expr || ""),
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
        type: target.type || 'timeserie'
      };
    });
    options.targets = targets;
    return options;
  }
}
