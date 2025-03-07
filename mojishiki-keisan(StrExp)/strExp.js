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
     * @param {string} strExp 文字列で書かれた文字式
     * @returns {object} StrExpオブジェクト
     */
    constructor(strExp = '0', useBigInt = false){
        const REG = StrExp.PATTERN;
        if(!REG.test(strExp)){
            throw new TypeError('invaild String Expression');
        }
        let arrayIndex = 0;
        let currentStr1 = ''; // multiedNum
        let currentStr2 = ''; // multiedStr
        let currentStr3 = ''; // pow
        let isGeningPow = false;
        for(let i = 0; i < strExp.length; i++){
            let cSt = strExp.at(i);
            const isNum = function(val){
                return Number.isNaN(Number(val))
            }
            const isSign = function(val){
                return val === '+' || val === '-';
            }
            if ((!isNum(cSt) || cSt === '.') && !isGeningPow) {
                currentStr1 += cSt;
            } else if(cSt === '^' || (isGeningPow && (!currentStr3 && isSign(cSt)))){
                !isGeningPow ? i++ : null /*何もしない*/;
                cSt = strExp.at(i);
                currentStr3 += isNum(cSt) ? '' : cSt;
                isGeningPow = true;
            } else if (!isSign(cSt)) {
                currentStr2 += cSt;
            }
            if(isSign(cSt) && (i !== 0 || isGeningPow) || i === strExp.length - 1){
                currentStr3 ||= '1';
                currentStr1 = (useBigInt ? BigInt : Number)(currentStr1);
                currentStr3 = (useBigInt ? BigInt : Number)(currentStr3);
                this[arrayIndex] = new StrExp.#Exp(currentStr1, currentStr2, currentStr3);
                if(this[arrayIndex].multiedStr === ''){
                    this[arrayIndex].pow = useBigInt ? 0n : 0;
                }
                arrayIndex++;
                [currentStr1, currentStr2, currentStr3] = ['', '', ''];
                isGeningPow = false;
            }
            if(cSt === '-'){
                currentStr1 += cSt;
            }
        }
        /**
         * @type {string}
         */
        this.EXP_ID = (function(){
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
        for(const exp of objExp){
            exp.multiedNum = -(exp.multiedNum);
        }
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
        let resultList = [new StrExp('0')];
        const mergedExp = [...objExp1, ...objExp2];
        const mostExp = StrExp.theMostExp(mergedExp);
        const worstExp = StrExp.#theWorstExp(mergedExp);
        const MULTIED_STR = StrExp.pickExp(objExp1, 1)[0].multiedStr;
        for(let i = 0; i <= mostExp; i++){
            resultList[i] = StrExp.pickExp(mergedExp, i);
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
        return new StrExp(exp);
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
        StrExp.invert(inverted);
        return StrExp.positive(objExp1, inverted);
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
                        results += `${multiResult}x^${powResult}`;
                    }
                }
            }
        }
        let result = new StrExp(results);
        result = StrExp.positive(result, new StrExp('0'));
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
        console.log(StrExp.theMostExp(objExp1), StrExp.theMostExp(objExp2))
        const EXP1 = StrExp.theMostExp(objExp1) - StrExp.theMostExp(objExp2);
        if(EXP1 < 0){
            throw new RangeError('objExp2 exp is bigger than objExp1 exp');
        }
        const MULTIED_STR = StrExp.pickExp(objExp1, 1)[0].multiedStr;
        let multiList = [], expStr = '';
        const EXP2 = StrExp.#theWorstExp([...objExp1, ...objExp2]);
        const EXP3 = StrExp.theMostExp([...objExp1, ...objExp2]);
        for(let i = EXP1, 
            repeat = EXP3 - EXP2,
            most1 = StrExp.theMostExp(objExp1), 
            most2 = StrExp.theMostExp(objExp2); 
            repeat > 0;
            i--, 
            repeat--,
            most1 = StrExp.theMostExp(objExp1),
            most2 = StrExp.theMostExp(objExp2)
        ){
            let numList = [];
            for(let j = 0; j < Math.abs(EXP1) + 2; j++){
                numList[j] = objExp1.assign(
                    {[MULTIED_STR]: j + 1}, j + 1
                ) / objExp2.assign(
                    {[MULTIED_STR]: j + 1}, j + 1
                );
            }
            console.log(numList)
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
            objExp1 = StrExp.negative(objExp1, StrExp.pickExp(objExp1, most1));
            objExp2 = StrExp.negative(objExp2, StrExp.pickExp(objExp2, most2));
        }
        const result = new StrExp(expStr);
        return result;
    }
    static from(iteratable){
        const StrExpObj = Object.create(StrExp.prototype);
        const modifiedArray = [...iteratable];
        for(const propName in modifiedArray){
            StrExpObj[propName] = modifiedArray[propName]
        }
        StrExpObj.length = modifiedArray.length;
        StrExpObj.EXP_ID = (function(){
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
    }
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
                ((assignNums[exp.multiedStr] ?? defaultNum) ** exp.pow)
            );
        }
        return result;
    }
    toString(){
        let returnStr = '';
        for (const str of this){
            if (str.multiedNum.toString().match('\\-')) {
                returnStr += str.multiedNum + str.multiedStr;
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
    static version = 'Beta 2.2.5';
}

const SE = StrExp;

Object.defineProperty(String.prototype, 'canConvertStrExp', {
    value: function(){
        return StrExp.PATTERN.test(this.valueOf());
    }
});
