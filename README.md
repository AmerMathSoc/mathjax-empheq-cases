**NOTE**

**This extension is now part of MathJax v3.2.0.**

**This repository has been archived.**

# mathjax-empheq-cases

MathJax TeX extension aiming to (partially) implement the [empheq package](https://ctan.org/pkg/cases) and the [cases package](https://ctan.org/pkg/empheq).

**Note.** Until MathJax supports colspan and rowspan, this will remain a rather hacky solution.

## MathJax Extension: `empheq.js`

Supported macros and environments:

```
empheq
empheqlbrace
empheqrbrace
empheqlbrack
empheqrbrack
empheqlangle
empheqrangle
empheqlparen
empheqrparen
empheqlvert
empheqrvert
empheqlVert
empheqrVert
empheqlfloor
empheqrfloor
empheqlceil
empheqrceil
empheqbiglbrace
empheqbigrbrace
empheqbiglbrack
empheqbigrbrack
empheqbiglangle
empheqbigrangle
empheqbiglparen
empheqbigrparen
empheqbiglvert
empheqbigrvert
empheqbiglVert
empheqbigrVert
empheqbiglfloor
empheqbigrfloor
empheqbiglceil
empheqbigrceil
empheql
empheqr
empheqbigl
empheqbigr
```

## MathJax Extension: `cases.js`

**Important.** The `cases` extension depends on `empheq`.

Supported macros and environments:

```
numcases
subnumcases
````


## How to use

See [the MathJax documentation for third party extensions](https://docs.mathjax.org/en/latest/options/ThirdParty.html).
