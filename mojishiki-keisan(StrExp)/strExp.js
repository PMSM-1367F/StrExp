/* version Beta 2.2.5 *******************/

function factorial(num = 0){
    if(num === 0){
        return 1;
    }
    return num * factorial(num - 1);
}

class StrExp{
    /**
     * StrExpオブジェクトを生成
     * @constructor
     * @param {string} strExp 文字列で書かれた文字式
     */
    constructor(strExp = '0', useBigInt = false){
        const REG = StrExp.PATTERN;
        if(!REG.test(strExp)){
            throw new TypeError('invaild String Expression');
        }
        let arrayIndex = 0;
        let currentStr1 = ''; // multiedNum
        let currentStr2 = {
            method: null,
            string: ''
        }; // multiedStr
        let currentStr3 = ''; // pow
        let isGeningPow = false;
        const isNum = function(val){
            return Number.isNaN(Number(val))
        }
        const isSign = function(val){
            return val === '+' || val === '-';
        }
        for(let i = 0; i < strExp.length; i++){
            let cSt = strExp.at(i);
            if(cSt === '#'){
                let escapeString = '';
                for(let j = 0; j < 2; j++){
                    i++;
                    cSt = strExp.at(i);
                    escapeString += cSt;
                }
                console.log(escapeString);
                const ESCAPE = StrExp.#getEscape(escapeString);
                currentStr2.method = ESCAPE;
                continue;
            }
            // 係数なら
            if ((!isNum(cSt) || cSt === '.') && !isGeningPow) {
                currentStr1 += cSt;
            // 指数なら
            } else if(cSt === '^' || (isGeningPow && (!currentStr3 && isSign(cSt)))){
                !isGeningPow ? i++ : null /*何もしない*/;
                cSt = strExp.at(i);
                currentStr3 += isNum(cSt) ? '' : cSt;
                isGeningPow = true;
            // 文字なら
            } else if (!isSign(cSt)) {
                currentStr2.string += cSt;
            }
            if(isSign(cSt) && (i !== 0 || isGeningPow) || i === strExp.length - 1){
                currentStr3 ||= '1';
                currentStr1 = (useBigInt ? BigInt : Number)(currentStr1);
                currentStr3 = (useBigInt ? BigInt : Number)(currentStr3);
                this[arrayIndex] = new StrExp.#Exp(currentStr1, currentStr2, currentStr3);
                if(this[arrayIndex].multiedStr.string === ''){
                    this[arrayIndex].pow = useBigInt ? 0n : 0;
                }
                arrayIndex++;
                [currentStr1, currentStr2, currentStr3] = ['', {method: null, string: ''}, ''];
                isGeningPow = false;
            }
            if(cSt === '-'){
                currentStr1 += cSt;
            }
        }
        /**
         * @type {string}
         */
        this[StrExp.getExpIdKey] = (function(){
            const ID_STR = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
            let id = '';
            outerLoop: for(let j = 0; j < 4; j++){
                for(let i = 0; i < 5; i++){
                    id += ID_STR.at(Math.floor(Math.random() * ID_STR.length));
                    if(i === 4 && j === 3){
                        break outerLoop;
                    }
                }
                id += '-';
            }
            return id;
        })();
        this.useBigInt = useBigInt;
        this.length = arrayIndex;
    }
    static #Exp = class Exp{
        constructor(cst1, cst2, cst3){
            this.multiedNum = cst1;
            this.multiedStr = cst2;
            this.pow = cst3;
        }
    }
    static {
        StrExp.#Exp.prototype[Symbol.toStringTag] = 'Exp';
        this.prototype[Symbol.iterator] = [][Symbol.iterator];
        this.prototype[Symbol.toStringTag] = 'StrExp';
    }
    static PATTERN = /((\-|\+)?[0-9]+([a-z]|[A-Z])*(\+|\-)?(\^[0-9])*)+/;
    static #isVaildVal(objExp){
        return objExp instanceof StrExp || objExp instanceof Array;
    }
    static #throwErrorIfInvaild(objExp){
        const result = StrExp.#isVaildVal(objExp);
        if(!result){
            throw new TypeError(`arguments is not StrExp object`);
        }
    }
    static #getEscape(str){
        switch(str){
            case 'as': {
                return 'asin';
            }
            case 'ac': {
                return 'acos';
            }
            case 'at': {
                return 'atan';
            }
            case 's0': {
                return 'sin';
            }
            case 'c0': {
                return 'cos';
            }
            case 't0': {
                return 'tan';
            }
            case 'sh': {
                return 'sinh';
            }
            case 'ch': {
                return 'cosh';
            }
            case 'th': {
                return 'tanh';
            }
            case 'fa': {
                return 'factorial';
            }
            case 'lg': {
                return 'log10';
            }
            case 'in': {
                return 'log';
            }
            default: {
                throw new SyntaxError('invaild escape');
            }
        }
    }
    /**
     * 項を取り出す
     * @param {StrExp} objExp StrExp オブジェクト
     * @param {number} w 取り出す項の次数
     * @returns 取り出した項をまとめたStrExpオブジェクト
     */
    static pickExp(objExp, w = 0){
        StrExp.#throwErrorIfInvaild(objExp);
        let powList = new StrExp('0');
        let i = 0;
        for(const exp of objExp){
            if (exp.pow === w) {
                powList[i] = exp;
                powList.length = i + 1;
                i++;
            }
        }
        return powList;
    }
    /**
     * 式の次数を取得
     * @param {StrExp} objExp StrExp
     * @returns この式の次数
     */
    static theMostExp(objExp){
        StrExp.#throwErrorIfInvaild(objExp);
        let mostPow = -Infinity;
        for(const exp of objExp){
            if(exp.pow > mostPow && exp.multiedNum !== 0){
                mostPow = exp.pow;
            }
        }
        return mostPow;
    }
    static #theWorstExp(objExp){
        StrExp.#throwErrorIfInvaild(objExp);
        let worstPow = Infinity;
        for(const exp of objExp){
            if(exp.pow < worstPow && exp.multiedNum !== 0){
                worstPow = exp.pow;
            }
        }
        return worstPow;
    }
    static #getDeltaStack(arr){
        let deltaList = [];
        for(let i = 0; i < arr.length - 1; i++){
            deltaList[i] = arr[i + 1] - arr[i];
        }
        if(deltaList[0] === 0){
            return [0];
        }
        if(deltaList.length <= 2){
            return deltaList;
        }
        return StrExp.#getDeltaStack(deltaList);
    }
    /**
     * 符号を反転
     * @param {StrExp} objExp StrExp
     */
    static invert(objExp){
        StrExp.#throwErrorIfInvaild(objExp);
        const strExpObj = Object.create(this.prototype);
        for(const n in objExp){
            if(Number.isNaN(Number(n))){
                break;
            }
            const expObj = new StrExp.#Exp(
                -(objExp[n].multiedNum), 
                objExp[n].multiedStr, 
                objExp[n].pow
            );
            strExpObj[n] = expObj;
        }
        return strExpObj;
    }
    /**
     * 足し算
     * @param {StrExp} objExp1 StrExp
     * @param {StrExp} objExp2 StrExp
     * @returns 足し算されたStrExp
     */
    static positive(objExp1, objExp2){
        StrExp.#throwErrorIfInvaild(objExp1);
        StrExp.#throwErrorIfInvaild(objExp2);
        let resultList = [new this('0')];
        const mergedExp = [...objExp1, ...objExp2];
        const mostExp = this.theMostExp(mergedExp);
        const worstExp = StrExp.#theWorstExp(mergedExp);
        const MULTIED_STR = this.pickExp(objExp1, 1)[0].multiedStr.string;
        for(let i = 0; i <= mostExp; i++){
            resultList[i] = this.pickExp(mergedExp, i);
        }
        let exp = '';
        for(let i = 0; i < resultList.length; i++){
            const nowExp = i + worstExp;
            let result = 0;
            for(let j = 0; j < resultList[i].length; j++){
                result += resultList[i][j].multiedNum;
            }
            if(result >= 0 && i !== 0){
                exp += '+';
            }
            zeroOrOne1: switch(nowExp){
                case 0: {
                    exp += `${result}`;
                    break zeroOrOne1;
                }
                case 1: {
                    exp += `${result}${MULTIED_STR}`;
                    break zeroOrOne1;
                }
                default: {
                    exp += `${result}${MULTIED_STR}^${nowExp}`;
                }
            }
        }
        return new this(exp);
    }
    /**
     * 引き算
     * @param {StrExp} objExp1 StrExp
     * @param {StrExp} objExp2 StrExp
     * @returns 引き算したStrExp
     */
    static negative(objExp1, objExp2){
        StrExp.#throwErrorIfInvaild(objExp1);
        StrExp.#throwErrorIfInvaild(objExp2);
        const inverted = JSON.parse(JSON.stringify([...objExp2]));
        this.invert(inverted);
        return this.positive(objExp1, inverted);
    }
    /**
     * 掛け算
     * @param {StrExp} objExp1 StrExp
     * @param {StrExp} objExp2 StrExp
     * @returns 掛け算したStrExp
     */
    static multiply(objExp1, objExp2){
        StrExp.#throwErrorIfInvaild(objExp1);
        StrExp.#throwErrorIfInvaild(objExp2);
        let results = '';
        const MULTIED_STR = this.pickExp(objExp1, 1)[0].multiedStr.string;
        for(let i = 0; i < objExp1.length; i++){
            for(let j = 0; j < objExp2.length; j++){
                const [float1, float2] = [
                    objExp1[i].multiedNum, 
                    objExp2[j].multiedNum
                ];
                const [pow1, pow2] = [objExp1[i].pow, objExp2[j].pow];
                const multiResult = float1 * float2;
                const powResult = pow1 + pow2;
                if(multiResult >= 0 && i !== 0){
                    results += '+';
                }
                zeroOrOne2: switch(powResult){
                    case 0: {
                        results += `${multiResult}`;
                        break zeroOrOne2;
                    }
                    case 1: {
                        results += `${multiResult}x`;
                        break zeroOrOne2;
                    }
                    default: {
                        results += `${multiResult}${MULTIED_STR}^${powResult}`;
                    }
                }
            }
        }
        let result = new this(results);
        result = this.positive(result, new this('0'));
        return result;
    }
    /**
     * 割り算(Beta番)
     * @param {StrExp} objExp1 StrExp
     * @param {StrExp} objExp2 StrExp
     * @returns 割り算されたStrExp
     */
    static divide(objExp1, objExp2){
        StrExp.#throwErrorIfInvaild(objExp1);
        StrExp.#throwErrorIfInvaild(objExp2);
        if(objExp2.toString().match('^0')){
            throw new Error('divided by 0');
        }
        const EXP1 = this.theMostExp(objExp1) - this.theMostExp(objExp2);
        if(EXP1 < 0){
            throw new RangeError('objExp2 exp is bigger than objExp1 exp');
        }
        const MULTIED_STR = this.pickExp(objExp1, 1)[0].multiedStr.string;
        let multiList = [], expStr = '';
        const EXP2 = StrExp.#theWorstExp([...objExp1, ...objExp2]);
        const EXP3 = this.theMostExp([...objExp1, ...objExp2]);
        for(let i = EXP1, 
            repeat = EXP3 - EXP2,
            most1 = this.theMostExp(objExp1), 
            most2 = this.theMostExp(objExp2); 
            repeat > 0;
            i--, 
            repeat--,
            most1 = this.theMostExp(objExp1),
            most2 = this.theMostExp(objExp2)
        ){
            let numList = [];
            for(let j = 0; j < Math.abs(EXP1) + 2; j++){
                numList[j] = objExp1.assign(
                    {[MULTIED_STR]: j + 1}, j + 1
                ) / objExp2.assign(
                    {[MULTIED_STR]: j + 1}, j + 1
                );
            }
            console.debug(numList);
            multiList[i] = (
                i === 0 ? 
                numList[0] : 
                StrExp.#getDeltaStack(numList)[0] / factorial(Math.abs(i))
            );
            // 内部的な0除算が行われたとき ここから
            multiList[i] = Number.isNaN(multiList[i]) ? 0 : multiList[i];
            // ここまで
            if(multiList[i] >= 0 && i !== EXP1){
                expStr += '+';
            }
            if (i === 0) {
                expStr += `${multiList[i]}`;
            } else if(i === 1){
                expStr += `${multiList[i]}${MULTIED_STR}`;
            } else {
                expStr += `${multiList[i]}${MULTIED_STR}^${i}`;
            }
            objExp1 = this.negative(objExp1, this.pickExp(objExp1, most1));
            objExp2 = this.negative(objExp2, this.pickExp(objExp2, most2));
        }
        const result = new this(expStr);
        return result;
    }
    /**
     * 反復可能オブジェクトをStrExpに変換
     * @param {Iterable} iterable 反復可能オブジェクト
     * @returns StrExp
     */
    static from(iterable){
        const StrExpObj = Object.create(this.prototype);
        const modifiedArray = [...iterable];
        for(const propName in modifiedArray){
            StrExpObj[propName] = modifiedArray[propName]
        }
        StrExpObj.length = modifiedArray.length;
        StrExpObj[StrExp.getExpIdKey] = (function(){
            const ID_STR = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
            let id = '';
            outerLoop: for(let j = 0; j < 4; j++){
                for(let i = 0; i < 5; i++){
                    id += ID_STR.at(Math.floor(Math.random() * ID_STR.length));
                    if(i === 4 && j === 3){
                        break outerLoop;
                    }
                }
                id += '-';
            }
            return id;
        })();
        return StrExpObj;
    }
    static getExpIdKey = Symbol('expKey')
    /**
     * 代入
     * @param {object} assignNums 代入する文字と値をまとめたオブジェクト
     * @param {number} defaultNum 代入できなかった時のデフォルト値
     * @returns 代入した結果
     */
    assign(assignNums, defaultNum){
        let result = 0;
        for(const exp of this){
            result += (
                exp.multiedNum * 
                (((
                    (exp.multiedStr.method !== 'factorial') ? 
                    ((exp.multiedStr.method !== null) ?
                    Math[exp.multiedStr.method] : factorial) : (n => n)
                )(assignNums[exp.multiedStr.string]) ?? defaultNum) ** exp.pow)
            );
        }
        return result;
    }
    toString(){
        let returnStr = '';
        for (const str of this){
            const m = str.multiedNum.method;
            if (str.multiedNum.toString().match('\\-')) {
                returnStr += `${str.multiedNum}${m ?? ''}${m ? '(' : ''}${str.multiedStr.string}${m ? ')' : ''}`;
            } else {
                returnStr += (
                    returnStr ? '+' : ''
                ) + str.multiedNum + str.multiedStr;
            }
            if(str.pow > 1 || str.pow < 0){
                returnStr += '^' + str.pow;
            }
        }
        return returnStr;
    }
    add(objExp){
        return StrExp.positive(this, objExp);
    }
    sub(objExp){
        return StrExp.negative(this, objExp);
    }
    mul(objExp){
        return StrExp.multiply(this, objExp);
    }
    div(objExp){
        return StrExp.divide(this, objExp);
    }
    static version = 'Beta 2.2.5';
}

const SE = StrExp;
