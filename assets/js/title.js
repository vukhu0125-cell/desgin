var titles = [
  "@",
  "@i",
  "@it",
  "@its",
  "@its.m",
  "@its.me",
  "@its.mee",
  "@its.meem",
  "@its.meemo",
  "@its.meemo123"
];

function changeTitle() {
  var index = 0;

  setInterval(function() {
      document.title = titles[index];
      index = (index + 1) % titles.length;
  }, 1000);
}

changeTitle();
