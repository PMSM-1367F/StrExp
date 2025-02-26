/* version Beta 2.1.0 *******************/

/**
 * 階乗
 * @param {number} num 数字
 * @returns 結果
 */
function factorial(num){
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
    constructor(strExp = '0'){
        const REG = /((\-|\+)?[0-9]+([a-z]|[A-Z])*(\+|\-)?(\^[0-9])*)+/;
        if(!REG.test(strExp)){
            throw new TypeError('invaild String Expression');
        }
        let arrayIndex = 0;
        let currentStr1 = ''; // multiedNum
        let currentStr2 = ''; // multiedStr
        let currentStr3 = ''; // pow
        let isGeningPow = false;
        for(let i = 0; i < strExp.length; i++){
            const cSt = strExp.at(i);
            if ((!Number.isNaN(Number(cSt)) || cSt === '.') && !isGeningPow) {
                currentStr1 += cSt;
            } else if(cSt === '^' || isGeningPow){
                !isGeningPow ? i++ : null /*何もしない*/;
                currentStr3 += strExp.at(i);
                isGeningPow = true;
                continue;
            } else if (!(cSt === '+' || cSt === '-')) {
                currentStr2 += cSt;
            }
            if(cSt === '+' || cSt === '-' && i !== 0){
                this[arrayIndex] = {
                    multiedNum: currentStr1, 
                    multiedStr: currentStr2,
                    pow: currentStr3
                }
                if(this[arrayIndex].multiedStr === ''){
                    this[arrayIndex].pow = '0';
                }
                arrayIndex++;
                [currentStr1, currentStr2, currentStr3] = ['', '', ''];
                isGeningPow = false;
            }
            if(cSt === '-'){
                currentStr1 += cSt;
            }
            currentStr3 ||= '1';
        }
        this[arrayIndex] = {
            multiedNum: currentStr1, 
            multiedStr: currentStr2, 
            pow: currentStr3
        }
        if(this[arrayIndex].multiedStr === ''){
            this[arrayIndex].pow = '0';
        }
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
        this.length = arrayIndex + 1;
    }
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
            if (exp.pow === w.toString()) {
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
                mostPow = Number(exp.pow);
            }
        }
        return mostPow;
    }
    static #theWorstExp(objExp){
        StrExp.#throwErrorIfInvaild(objExp);
        let worstPow = 0;
        for(const exp of objExp){
            if(exp.pow < worstPow && exp.multiedNum !== 0){
                worstPow = Number(exp.pow);
            }
        }
        return worstPow;
    }
    /**
     * 符号を反転
     * @param {StrExp} objExp StrExp
     */
    static invert(objExp){
        StrExp.#throwErrorIfInvaild(objExp);
        for(const exp of objExp){
            exp.multiedNum = (-Number(exp.multiedNum)).toString();
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
                result += Number(resultList[i][j].multiedNum);
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
        StrExp.invert(objExp2);
        return StrExp.positive(objExp1, objExp2);
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
                    Number(objExp1[i].multiedNum), 
                    Number(objExp2[j].multiedNum)
                ];
                const [pow1, pow2] = [Number(objExp1[i].pow), Number(objExp2[j].pow)];
                const multiResult = float1 * float2;
                const powResult = pow1 + pow2;
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
        if(objExp2.toString().match('0')){
            throw new Error('divided by 0');
        }
        console.log(StrExp.theMostExp(objExp1), StrExp.theMostExp(objExp2))
        const EXP1 = StrExp.theMostExp(objExp1) - StrExp.theMostExp(objExp2);
        if(EXP1 < 0){
            throw new RangeError('objExp2 exp is bigger than objExp1 exp');
        }
        const MULTIED_STR = StrExp.pickExp(objExp1, 1)[0].multiedStr;
        let multiList = [], expList = [];
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
            for(let j = 0; j < EXP1 + 2; j++){
                numList[j] = objExp1.assign(
                    {[MULTIED_STR]: j + 1}
                ) / objExp2.assign(
                    {[MULTIED_STR]: j + 1}
                );
            }
            multiList[i] = (
                i === 0 ? 
                numList[0] : 
                StrExp.getDeltaStack(numList)[0] / factorial(Math.abs(i))
            );
            // 0除算が行われたとき ここから
            multiList[i] = Number.isNaN(multiList[i]) ? 0 : multiList[i];
            // ここまで
            if (i === 0) {
                expList[i] = new StrExp(`${multiList[i]}`);
            } else if(i === 1){
                expList[i] = new StrExp(`${multiList[i]}${MULTIED_STR}`);
            } else {
                expList[i] = new StrExp(`${multiList[i]}${MULTIED_STR}^${i}`);
            }
            objExp1 = StrExp.negative(objExp1, StrExp.pickExp(objExp1, most1));
            objExp2 = StrExp.negative(objExp2, StrExp.pickExp(objExp2, most2));
        }
        let result = new StrExp(`0${MULTIED_STR}`);
        for(let i = 0; i < expList.length; i++){
            result = StrExp.positive(result, expList[i]);
        }
        return result;
    }
    static getDeltaStack(arr){
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
        return StrExp.getDeltaStack(deltaList);
    }
    /**
     * 代入
     * @param {object} assignNums 代入する文字と値をまとめたオブジェクト
     * @param {number} defaultNum 代入できなかった時のデフォルト値
     * @returns 代入した結果
     */
    assign(assignNums, defaultNum){
        let result = 0;
        for(const n in this){
            if(n === 'length'){
                break;
            }
            result += (
                Number(this[n].multiedNum) * 
                ((assignNums[this[n].multiedStr] ?? defaultNum) ** Number(this[n].pow))
            );
        }
        return result;
    }
    toString(){
        let returnStr = '';
        for (const str of this){
            if (str.multiedNum.match('\\-')) {
                returnStr += str.multiedNum + str.multiedStr;
            } else {
                returnStr += '+' + str.multiedNum + str.multiedStr;
            }
            if(str.pow > 1){
                returnStr += '^' + str.pow;
            }
        }
        return returnStr;
    }
    static version = 'Beta 2.1.0';
}

StrExp.prototype[Symbol.iterator] = [][Symbol.iterator];
StrExp.prototype[Symbol.toStringTag] = 'StrExp';
const SE = StrExp;

Object.defineProperty(String.prototype, 'canConvertStrExp', {
    value: function(){
        return /((\-|\+)?[0-9]+([a-z]|[A-Z])*(\+|\-)?(\^[0-9])*)+/.test(this.valueOf());
    }
});
