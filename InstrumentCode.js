goog.module('instrument.code');

/** @record */
class InstrumentationPerLine {
  /**
   * @param {!Array<number>} colNumberArray
   * @param {!Array<number>} frequency
   */
  constructor(colNumberArray, frequency) {
    /** @type {!Array<number>} */
    this.colNumberArray = colNumberArray;
    /** @type {!Array<number>} */
    this.frequency = frequency;
  }
}

class InstrumentCode {

  constructor() {
    /** @type {boolean} */
    this.hasReportSent = false;
    /** @type {!Map<string, !Map<number, !InstrumentationPerLine>>} */
    this.reportData = new Map();
  }

  /**
   * The instrumentCode function which is the instrumentation functon that will be called during
   * program execution. It gathers all the data in the reportData variable defined above.
   * 
   * @param {string} param
   * @param {number} lineNumber
   * @param {number} colNumber
   */
  instrumentCode(param, lineNumber, colNumber) {
    if (this.hasReportSent) {
      return;
    }

    if (this.reportData.has(param)) {
      /** @const {!Map<number, !InstrumentationPerLine>} */
      const paramReport = this.reportData.get(param);
      if (paramReport.has(lineNumber)) {
        /** @const {!InstrumentationPerLine} */
        const lineNumberArray = paramReport.get(lineNumber);
        if (lineNumberArray.colNumberArray.includes(colNumber)) {
          let index = lineNumberArray.colNumberArray.indexOf(colNumber);
          lineNumberArray.frequency[index]++;
        } else {
          lineNumberArray.colNumberArray.push(colNumber);
          lineNumberArray.frequency.push(1);
        }
      } else {
        /** @const {!InstrumentationPerLine} */
        const instrumentationPerLine =
            new InstrumentationPerLine([colNumber], [1]);
        paramReport.set(lineNumber, instrumentationPerLine);
      }

    } else {
      /** @const {!Map<number, !InstrumentationPerLine>} */
      const lineNumberMap = new Map();
      /** @const {!InstrumentationPerLine} */
      const instrumentationPerLine =
          new InstrumentationPerLine([colNumber], [1]);
      lineNumberMap.set(lineNumber, instrumentationPerLine);
      this.reportData.set(param, lineNumberMap);
    }
  }

  /**
   * Converts the reportData into a json.
   */
  createJson() {
    const reportJson = [];

    this.reportData.forEach((value, key) => {
      const tempObj = {param: key, lineMapping: []};
      value.forEach((value, key) => {tempObj.lineMapping.push({
                                  lineNo: key,
                                  colNumberArray: value.colNumberArray,
                                  frequency: value.frequency
                                })})
      reportJson.push(tempObj);
    })

    return reportJson;
  }

  /** Sends or prints the profiling data collected. */
  sendCoverageData() {
    this.hasReportSent = true;

    const reportJson = this.createJson();
    console.log(reportJson);
  }
}

const instrumentCodeInstance = new InstrumentCode();

window.setTimeout(() => {instrumentCodeInstance.sendCoverageData()}, 2000);

exports = {instrumentCodeInstance};