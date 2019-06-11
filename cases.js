MathJax.Extension['TeX/cases'] = {
  version: '1.0.0',
  subCases: false,
  subNo: 0
};

MathJax.Hub.Register.StartupHook('TeX empheq Ready', function() {
  var TEX = MathJax.InputJax.TeX,
    STACKITEM = TEX.Stack.Item,
    AMS = MathJax.Extension['TeX/AMSmath'],
    EMPHEQ = MathJax.Extension['TeX/empheq'],
    CASES = MathJax.Extension['TeX/cases'],
    CONFIG = MathJax.Hub.config.TeX.equationNumbers;

  TEX.Definitions.Add({
    environment: {
      numcases: ['NumCases', 'EndNumCases', false],
      subnumcases: ['NumCases', 'EndNumCases', true]
    }
  });

  var ENTRY = TEX.Parse.prototype.Entry;
  var FORMAT = CONFIG.formatNumber;

  CONFIG.formatNumber = function(n) {
    n = FORMAT(n);
    if (!CASES.subCases) return n;
    AMS.number--;
    var m = ++CASES.subNo;
    return n + String.fromCharCode(0x60 + m);
  };

  TEX.Parse.Augment({
    NumCases: function(begin, subcases) {
      var left = this.GetArgument('\\begin{' + begin.name + '}');
      this.stack.global.subnumcases = left;
      var array = STACKITEM.AMSarray(begin.name, true, true, this.stack).With({
        isNumCases: true,
        arraydef: {
          displaystyle: false,
          rowspacing: '.5em',
          columnalign: 'left left',
          columnspacing: '1em',
          rowspacing: '.2em',
          side: TEX.config.TagSide,
          minlabelspacing: TEX.config.TagIndent
        }
      });
      CASES.subCases = subcases;
      CASES.subNo = 0;
      this.Push(begin);
      return array;
    },

    EndNumCases: function(begin, data) {
      var left = this.stack.global.subnumcases;
      delete this.stack.global.subnumcases;
      var table = data[0];
      EMPHEQ.Left(table, table, left + '\\empheqlbrace\\,', this.stack);
      if (CASES.subCases) {
        CASES.subCases = false;
        if (CASES.subNo) AMS.number++;
      }
      var label = this.stack.global.label;
      if (label) {
        AMS.eqlabels[label].tag = String(FORMAT(AMS.number));
        AMS.eqlabels[label].id = Object.keys(AMS.eqIDs)[0] || '';
      }
      return data;
    },

    Entry: function(name) {
      if (!this.stack.Top().isNumCases) return ENTRY.call(this, name);
      this.Push(STACKITEM.cell().With({ isEntry: true, name: name }));
      //
      //  Make second column be in \text{...}
      //
      var string = this.string;
      var braces = 0,
        i = this.i,
        m = string.length;
      //
      //  Look through the string character by character...
      //
      while (i < m) {
        var c = string.charAt(i);
        if (c === '{') {
          //
          //  Increase the nested brace count and go on
          //
          braces++;
          i++;
        } else if (c === '}') {
          //
          //  If there are too many close braces, just end (we will get an
          //    error message later when the rest of the string is parsed)
          //  Otherwise
          //    decrease the nested brace count,
          //    go on to the next character.
          //
          if (braces === 0) {
            break;
          } else {
            braces--;
            i++;
          }
        } else if (c === '&' && braces === 0) {
          //
          //  Extra alignment tabs are not allowed in cases
          //
          TEX.Error([
            'ExtraCasesAlignTab',
            'Extra alignment tab in text for case environment'
          ]);
        } else if (c === '\\' && braces === 0) {
          //
          //  If the macro is \cr or \\, end the search, otherwise skip the macro
          //  (multi-letter names don't matter, as we will skip the rest of the
          //   characters in the main loop)
          //
          var cs = (this.string.slice(i + 1).match(/^[a-z]+|./i) || [])[0];
          if (cs === '\\' || cs === 'cr' || cs === 'end' || cs === 'label') {
            break;
          } else {
            i += cs.length;
          }
        } else {
          //
          //  Go on to the next character
          //
          i++;
        }
      }
      //
      //  Process the second column as text and continue parsing from there,
      //
      var text = string.substr(this.i, i - this.i);
      this.Push.apply(this, this.InternalMath(text, 0));
      this.i = i;
    }
  });

  MathJax.Hub.Startup.signal.Post('TeX cases Ready');
});

MathJax.Callback.Queue([
  'loadComplete',
  MathJax.Ajax,
  '[empheq-cases]/cases.js'
]);
