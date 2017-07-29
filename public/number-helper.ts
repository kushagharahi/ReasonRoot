export default class NumberHelper {
  contructor(){
  };

  formatAsCurrency(val: number): string{
    return(val == null) ? "": "$" + val.toFixed(2);
  };
}
