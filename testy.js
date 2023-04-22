const arr1 = [1, 3, 2, 6, 7, 1938219, 932, 1, 1, 2, 3];
const arr2 = [4, 3, 2, 1];
const arr3 = [5, 2, 8, 4, 9, 1, 6];
let result = [0];
let max = 0;

function sort(arr1) {
  for (i = 0; i < arr1.length; i++) {
    for (j = i + 1; j < arr1.length; j++) {
      if (arr1[j] < arr1[i]) {
        let a = arr1[i];
        //console.log(a);
        arr1[i] = arr1[j];
        arr1[j] = a;
        console.log(arr1);
      }
    }
  }
  return arr1;
}
sort(arr1);

arr1.sort((a, b) => a - b);
