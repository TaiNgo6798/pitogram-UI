
# Pitogram is a photo social website.
  * See new awsome images everyday.
  * Connecting people who interested in photography

# Some Screenshots
![N|Solid](https://firebasestorage.googleapis.com/v0/b/taingoblog.appspot.com/o/git%20screen%20shots%2F2022-03-25%2000_37_02-.png?alt=media&token=09000f3d-2b27-49e5-9e98-13a32dc0625c)

![N|Solid](https://firebasestorage.googleapis.com/v0/b/taingoblog.appspot.com/o/git%20screen%20shots%2F2022-03-24%2023_53_05-index.js%20-%20Pitogram_Social%20-%20Visual%20Studio%20Code.png?alt=media&token=99065328-d28c-4cb2-9a6c-c0ff423f1acf)

![N|Solid](https://firebasestorage.googleapis.com/v0/b/taingoblog.appspot.com/o/git%20screen%20shots%2F2022-05-01%2019_31_31-.png?alt=media&token=487dc2cf-e112-4841-ad40-632f74f7cf2f)

![N|Solid](https://firebasestorage.googleapis.com/v0/b/taingoblog.appspot.com/o/git%20screen%20shots%2F2022-03-24%2023_42_30-index.js%20-%20Pitogram_Social%20-%20Visual%20Studio%20Code.png?alt=media&token=02856bcf-7426-4794-9d36-a069f331bcf1)

![N|Solid](https://firebasestorage.googleapis.com/v0/b/taingoblog.appspot.com/o/git%20screen%20shots%2F2022-03-27%2022_33_54-Pitogram.png?alt=media&token=6bfa8e53-9476-4dec-8c6e-a47011a6dd9e)

![N|Solid](https://firebasestorage.googleapis.com/v0/b/taingoblog.appspot.com/o/git%20screen%20shots%2F2022-03-27%2022_50_43-Pitogram.png?alt=media&token=a5461738-00dc-40e6-8041-21d13c31e375)

## Features
  - Optimize Performance for images by Lazy loading and placeHolder.
  - Can get Multi-Size of images like: **small, medium, large** and **original**.
  ![N|Solid](https://firebasestorage.googleapis.com/v0/b/taingoblog.appspot.com/o/git%20screen%20shots%2F2022-03-25%2000_25_49-TaiNgoBlog%20%E2%80%93%20Storage%20%E2%80%93%20Firebase%20console.png?alt=media&token=a20dfafd-e058-4172-8e93-8b3f58362fd8)
  - Save images with its Exif(Height, Width, Lens, Artist, Camera model, Created day, ...)
  - **Chatting** with anyone.
  - **Reacting** to someone's comment.
  - **Search photos** base on its **tags**.
  - **Auto setting tags** for every photo you upload using [Microsoft Vision API](https://westcentralus.dev.cognitive.microsoft.com/docs/services/computer-vision-v3-1-ga/operations/56f91f2e778daf14a499f200)

## Installation

Install the dependencies and devDependencies and start the server.
```sh
$ cd pitogram
```
### Before running(for windows)
```sh
npm install -g win-node-env
```
Node version: **12.22.11**

### Docker
```sh
$ docker-compose up
```

### Front-end
Eslint will trigger when build on production
```sh
$ cd pfront
$ npm i
$ npm run dev
```
### Back-end
```sh
$ cd pback
$ npm i
$ npm run start:dev
```

### Run lint
```sh
$ cd pback
$ npm run lint:fix
$ cd pfront
$ npm run prebuild
```

## Tech

##### Pitogram uses a number of open source projects to work properly:

* [ReactJS] - HTML enhanced for web apps!
* [NestJS] - A progressive Node.js framework.
* [Firebase] - I store photos in here, that's cool and fast.
* [Ant Design] - Awesome CSS framework.
* [Graphql] - A query language for your API.
* [MongoDB] - The most popular database for modern apps.
* [Webpack] - Performance!
* [TypeORM] - Amazing ORM for TypeScript and JavaScript.
* [Docker] - Empowering App Development for Developers.
* [NginX] - Improve the Performance, Reliability, and Security of Your Applications.
* [CloudFlare] - For SSL.

And of course Pitogram itself is open source with a [public repository](https://gitlab.com/TaiNgo/pitogram)
 on Gitlab.
 
##### Language:
* Javascript
* Typescript
##### Code Formater
* ESlint
* TSLint
* Prettier
##### Working tools
* Git
* Trello


**Free Software, Hell Yeah!**

