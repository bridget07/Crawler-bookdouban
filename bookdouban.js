// 分析网页内容
var cheerio = require('cheerio')

// ES5 定义一个类
// var Book = function() {
//     this.name = ''
//     this.score = 0
//     this.quote = ''
//     this.ranking = 0
//     this.coverUrl = ''
// }

// ES6 定义一个类
class Book {
    constructor() {
        // 分别是电影名/评分/引言/排名/封面图片链接
        // this.name = ''
        // this.score = 0
        // this.quote = ''
        // this.ranking = 0
        // this.coverUrl = ''
        this.country = '中'
        this.year = 0
    }
}

// 引入自己写的模块
var log = require('./utils').log
var cached_url = require('./utils').cached

/*
<tr class="item">
    <td width="100" valign="top">
        <a class="nbg" href="https://book.douban.com/subject/1770782/" onclick="moreurl(this,{i:'0'})">
            <img src="https://img3.doubanio.com/spic/s1727290.jpg" width="64" />
        </a>
    </td>
    <td valign="top">
        <div class="pl2">
            <a href="https://book.douban.com/subject/1770782/" onclick=&#34;moreurl(this,{i:&#39;0&#39;})&#34; title="追风筝的人">
追风筝的人
</a> &nbsp; <img src="https://img3.doubanio.com/pics/read.gif" alt="可试读" title="可试读" />
            <br/>
            <span style="font-size:12px;">The Kite Runner</span>
        </div>
        <p class="pl">[美] 卡勒德·胡赛尼 / 李继宏 / 上海人民出版社 / 2006-5 / 29.00元</p>
        <div class="star clearfix">
            <span class="allstar45"></span>
            <span class="rating_nums">8.8</span>
            <span class="pl">(
261889人评价
)</span>
        </div>
        <p class="quote" style="margin: 10px 0; color: #666">
            <span class="inq">为你，千千万万遍</span>
        </p>
    </td>
</tr>
*/


var bookFromDiv = function(div, j) {
    var e = cheerio.load(div)
    // 创建一个图书类的实例并且获取数据
    // 这些数据都是从 html 结构里面人工分析出来的
    var book = new Book()
    // 获取 .title 标签的 innerText
    var a = e('.pl2 a').text().trim()
    // book.name = a.split(': ')[1] || a
    // book.score = e('.rating_nums').text()
    // book.quote = e('.inq').text()

    var r = e('td a').attr('onclick')
    r = r.split(':')[1].split('}')[0].slice(1, -1)
    r = parseInt(r) + 1
    book.ranking = (j * 25 + r).toString()
    // log('debug', j, book.ranking)
    // book.coverUrl = e('a img').attr('src')

    // 添加评论人数
    var ratings = e('.star').find('span').last().text()
    // book.ratings = ratings.slice(1).trim().split('人')[0]

    // 添加国家和年份
    var t = e('p.pl').text()
    t = t.split(']')[0].slice(1)
    if (t.length > 5) {
        t = '中'
    }
    book.country = t
    book.year = e('p.pl').text().split('/').reverse()[1].slice(1, 5)

    return book
}

var booksFromUrl = function(url, j) {
    // 把数据缓存起来
    var body = cached_url(url)
    // log('body 解码后', body)
    // cheerio.load 用来把 HTML 文本解析为一个可以操作的 DOM
    var e = cheerio.load(body)
    // 可以使用选择器语法操作 cheerio 返回的对象
    // 一共有 25 个 .item
    var bookDivs = e('tr.item')
    // log('debug',bookDivs[0])
    // 循环处理 25 个 tr.item
    var books = []
    for (var i = 0; i < bookDivs.length; i++) {
        var div = bookDivs[i]
        // log('debug, div', bookDivs[0])
        // 获取到 div 的 html 内容
        // 然后扔给 bookFromDiv 函数来获取到一个 book 对象
        var b = bookFromDiv(div, j)
        books.push(b)
    }
    return books
}

var __main = function() {
    // 主函数
    // https://book.douban.com/top250?start=0
    var books = []
    for (var i = 0; i < 10; i++) {
        var start = i * 25
        var url = 'https://book.douban.com/top250?start=' + start
        var bs = booksFromUrl(url, i)
        // 把 bs 数组里面的元素都添加到 books 数组中
        books = books.concat(bs)
    }
    // // 引入自己的模块, 必须是 ./ 开头
    var utils = require('./utils')
    utils.save('gao图书.json', books)
    // 下载封面图片
    // utils.downloadCovers(books)
}

__main()
