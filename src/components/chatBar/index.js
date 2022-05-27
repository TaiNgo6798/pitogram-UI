import React, { useState, useMemo, useContext, useEffect, useRef } from 'react'
import {
  Avatar,
  Badge,
  Skeleton,
  Input,
  Drawer,
  notification,
  Button,
} from 'antd'
import {
  SearchOutlined,
  DoubleRightOutlined,
  CloseOutlined,
  DoubleLeftOutlined,
} from '@ant-design/icons'

import gql from 'graphql-tag'
import { useQuery, useSubscription, useMutation } from '@apollo/react-hooks'
import { useMediaQuery } from 'react-responsive'
import * as _ from 'lodash'

import './index.scss'
import ChatWindow from './chatWindow'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/en'
dayjs.extend(relativeTime)
dayjs.locale('en')

//context
import { UserContext } from '@contexts/userContext'
import { ChatBarContext } from '@contexts/chatBarContext'

const IM_ONLINE = gql`
  mutation imOnline {
    imOnline
  }
`

const USERS = gql`
  query {
    users {
      _id
      email
      firstName
      lastName
      avatar
      dob
      gender
      lastSeen
    }
  }
`
const SUB_CHAT = gql`
  subscription newChatSentToMe {
    newChatSentToMe {
      text
      sendID
    }
  }
`
const SUB_ONLINE = gql`
  subscription {
    someOneJustOnline {
      _id
      lastSeen
    }
  }
`
const I_READ_MY_CHAT_WITH = gql`
  mutation iReadMyChatWith($_id: String!) {
    iReadMyChatWith(_id: $_id)
  }
`

const notify = (text, status) => {
  status === 1
    ? notification.success({
        message: text,
        placement: 'bottomRight',
      })
    : notification.error({
        message: text,
        placement: 'bottomRight',
      })
}

function ChatBar() {
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' })
  const isMobile = useMediaQuery({ maxWidth: 425 })
  const isMobileOrTablet = useMediaQuery({ maxWidth: 768 })

  const localAcvtiveWindows = JSON.parse(localStorage.getItem('activeWindows'))
  const localListBubleChat = JSON.parse(localStorage.getItem('listBubleChat'))

  //queries
  const { data, loading, refetch } = useQuery(USERS, {
    fetchPolicy: 'network-only',
  })
  //const { data: a } = useQuery(GET_COUNTER)
  //mutation
  const [imOnline] = useMutation(IM_ONLINE)
  const [iReadMyChatWith] = useMutation(I_READ_MY_CHAT_WITH)

  //context
  const {
    user: currentUser,
    getAvatarLinkById,
    unReadFrom = [],
    setUnReadFrom,
  } = useContext(UserContext)
  const { showChatBar, setShowChatBar } = useContext(ChatBarContext)

  //local states
  const [users, setUsers] = useState(data ? data.users : [])
  const [listBubleChat, setListBubleChat] = useState(localListBubleChat || [])
  const [activeWindows, setActiveWindows] = useState(localAcvtiveWindows || [])
  const [showChatWindowDrawer, setShowChatWindowDrawer] = useState(false)

  //refs
  // dung ref de handle cac state thay doi lien tuc (handle Closure Problems)
  const searchRef = useRef(null)
  const activeWindowsRef = useRef([])
  const listBubleChatRef = useRef([])
  const usersRef = useRef([])
  listBubleChatRef.current = listBubleChat
  activeWindowsRef.current = activeWindows
  usersRef.current = users

  useSubscription(SUB_CHAT, {
    onSubscriptionData: (e) =>
      receiveNewChat(e.subscriptionData.data.newChatSentToMe),
  })

  useSubscription(SUB_ONLINE, {
    onSubscriptionData: (e) =>
      someOneJustOnline(e.subscriptionData.data.someOneJustOnline),
  })

  useEffect(() => {
    imOnline()
    let imOnlineSubmit = setInterval(() => {
      imOnline()
    }, 25000)
    let refreshUsers = setInterval(() => {
      //cap nhat trang thai khi moi 30s
      refetch()
    }, 30000)
    return () => {
      clearInterval(imOnlineSubmit)
      clearInterval(refreshUsers)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [currentUser]) // khi currentUser trong context thay doi thi refetch lai

  useEffect(() => {
    if (data) {
      setUsers(data.users)
    }
  }, [data])

  useEffect(() => {
    localStorage.setItem('activeWindows', JSON.stringify([...activeWindows]))
  }, [activeWindows])

  useEffect(() => {
    localStorage.setItem('listBubleChat', JSON.stringify([...listBubleChat]))
  }, [listBubleChat])

  useEffect(() => {
    //gioi han so cua so chat, neu qua 3 cua so => thu nho
    if (activeWindows.length > 0 && activeWindows.length > 3) {
      onMinimizeWindow(activeWindowsRef.current[0]._id)
    }
  }, [activeWindows])

  const someOneJustOnline = (subscriptionData) => {
    try {
      const { _id, lastSeen } = subscriptionData
      //thay doi status tren chat bar
      setUsers((prev) =>
        prev.map((v) => {
          if (v._id === _id) {
            v.lastSeen = lastSeen // update lastSeen moi
          }
          return v
        }),
      )
      // thay doi status trong chat window
      if (activeWindows.some((v) => v._id === _id)) {
        setActiveWindows((prev) =>
          prev.map((v) => {
            if (v._id === _id) {
              v.lastSeen = lastSeen
            }
            return v
          }),
        )
      }
    } catch (error) {
      console.log(error)
      return error
    }
  }

  const iReadMyChat = (_id) => {
    document.title = 'Pitogram'
    setUnReadFrom((prev) => prev.filter((v) => v.sendID !== _id))
    iReadMyChatWith({
      variables: {
        _id,
      },
    })
  }

  const receiveNewChat = (newChat) => {
    const { sendID } = newChat
    const { firstName, lastName } = users.find((v) => v._id === sendID)
    document.title = `${firstName} ${lastName} sent you a message ...`
    {
      !isMobile && openChatWindow(sendID)
    }
    if (unReadFrom.map((v) => v.sendID).indexOf(sendID) === -1) {
      setUnReadFrom((prev) => [...prev, { sendID }])
    }
  }

  const howLongSinceMyLastSeen = (lastSeen) => {
    let minute = dayjs().diff(dayjs(lastSeen), 'minute')
    return minute
  }

  const loadUsers = useMemo(() => {
    try {
      if (!loading || data) {
        return users.map((v) => {
          return (
            <div
              className="user_chatBar"
              onClick={() => openChatWindow(v._id)}
              key={v._id}
              style={{
                backgroundColor:
                  unReadFrom.map((m) => m.sendID).indexOf(v._id) !== -1
                    ? 'rgb(242, 242, 242)'
                    : '',
              }}
            >
              <Badge
                color="green"
                dot={
                  howLongSinceMyLastSeen(v.lastSeen) < 1 ||
                  v._id === currentUser._id
                }
                style={{
                  margin: '5px',
                  height: '10px',
                  width: '10px',
                  border: 'solid 1px white',
                }}
                size={30}
              >
                <Avatar
                  size={36}
                  style={{ minWidth: '36px' }}
                  src={getAvatarLinkById(v.avatar, v.gender)}
                />
              </Badge>

              <div className="name-and-status">
                <div style={{ display: 'flex' }}>
                  <p>{`${v.firstName} ${v.lastName}`}</p>
                  {unReadFrom.map((m) => m.sendID).indexOf(v._id) !== -1 && (
                    <p
                      style={{
                        color: '#f08a5d',
                        fontSize: 'smaller',
                        position: 'absolute',
                        right: '1em',
                        bottom: '30%',
                      }}
                    >
                      new message !
                    </p>
                  )}
                </div>
                <div className="status">
                  {howLongSinceMyLastSeen(v.lastSeen) < 1 ||
                  v._id === currentUser._id ? (
                    <span className="status_text">online</span>
                  ) : (
                    <p className="status_text">
                      {howLongSinceMyLastSeen(v.lastSeen) <= 30
                        ? dayjs(v.lastSeen).fromNow()
                        : null}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })
      }
    } catch (error) {
      notify(error.message, false)
      return <Skeleton loading={true} active />
    }
  }, [users, unReadFrom])

  const closeChatHandler = (_id) => {
    setActiveWindows((prev) => [...prev.filter((v) => v._id !== _id)])
    setListBubleChat((prev) => [...prev.filter((v) => v._id !== _id)])
    setShowChatWindowDrawer(false)
  }

  const onMinimizeWindow = (_id) => {
    const { avatar, firstName, lastName, gender } = usersRef.current.find(
      (v) => v._id === _id,
    )
    let newActiveChat = {
      _id,
      avatar,
      gender,
      name: `${firstName} ${lastName}`,
    }

    if (listBubleChatRef.current.every((v) => v._id !== _id)) {
      setListBubleChat((prev) => [...prev, newActiveChat])
    }

    // xoa user nay trong activeWindows
    setActiveWindows([...activeWindows.filter((v) => v._id !== _id)])
  }

  const openChatWindow = (_id) => {
    const {
      avatar,
      firstName,
      lastName,
      gender,
      lastSeen,
    } = usersRef.current.find((v) => v._id === _id)
    let newWindow = {
      _id,
      avatar,
      name: `${firstName} ${lastName}`,
      gender,
      lastSeen,
    }

    if (activeWindowsRef.current.every((v) => v._id !== _id)) {
      if (isDesktop) {
        setActiveWindows((prev) => [...prev, newWindow])
      } else {
        setActiveWindows([newWindow])
      }
    }
    //open drawer
    setShowChatWindowDrawer(true)
    // xoa user nay trong bublechat
    setListBubleChat((prev) => [...prev.filter((v) => v._id !== _id)])
  }

  const loadListBubleChat = useMemo(() => {
    return listBubleChat.map((v) => {
      return (
        <div className="active-chat-icon" key={v._id}>
          <CloseOutlined onClick={() => closeChatHandler(v._id)} />
          <Avatar
            size={45}
            src={getAvatarLinkById(v.avatar, v.gender)}
            className="avatar"
            onClick={() => openChatWindow(v._id)}
          />
        </div>
      )
    })
  }, [listBubleChat])

  const loadActiveWindow = useMemo(() => {
    return activeWindows.map((v) => {
      const { _id, avatar, name, gender, lastSeen } = v
      return (
        <ChatWindow
          key={_id}
          receiveID={_id}
          onClose={(_id) => closeChatHandler(_id)}
          onMinimal={(_id) =>
            isDesktop ? onMinimizeWindow(_id) : closeChatHandler(_id)
          }
          avatar={getAvatarLinkById(avatar, gender)}
          name={name}
          iReadMyChat={(_id) => iReadMyChat(_id)}
          lastSeen={lastSeen}
        />
      )
    })
  }, [activeWindows])

  const ChangeToSlug = (text) => {
    //Đổi chữ hoa thành chữ thường
    let slug = text.toLowerCase()

    //Đổi ký tự có dấu thành không dấu
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
    slug = slug.replace(/đ/gi, 'd')

    //Delete các ký tự đặt biệt
    slug = slug.replace(
      /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|\ |_/gi,
      '',
    )

    return slug
  }

  const onSearch = (text) => {
    if (!text || text.length === 0) {
      setUsers(data.users)
    } else {
      setUsers([
        ...data.users.filter(
          (v) =>
            ChangeToSlug(`${v.firstName} ${v.lastName}`).indexOf(
              ChangeToSlug(text),
            ) !== -1,
        ),
      ])
    }
  }

  return (
    <>
      <Button
        className="close-chat-bar-button"
        onClick={() => setShowChatBar((prev) => !prev)}
      >
        {showChatBar ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
      </Button>
      <Drawer
        placement="right"
        width={isMobileOrTablet ? "100vw" : "18em"}
        className="chat-bar-drawer"
        mask={isMobileOrTablet}
        closable={true}
        onClose={() => setShowChatBar(false)}
        visible={showChatBar}
      >
        <div className={'container_chatBar'} id="chatbar">
          <div className="container_chatBar_top-body">
            <Input
              prefix={<SearchOutlined />}
              ref={searchRef}
              onChange={_.debounce(
                () => onSearch(searchRef.current.input.value),
                100,
              )}
            />
          </div>
          <div className="container_chatBar_body">
            {loading ? 'loading ...' : loadUsers}
          </div>
        </div>
      </Drawer>

      {isMobileOrTablet ? (
        <Drawer
          placement="right"
          width="100vw"
          className="chat-window-drawer"
          mask={false}
          closable={true}
          onClose={() => setShowChatWindowDrawer(false)}
          visible={showChatWindowDrawer}
        >
          {loadActiveWindow}
        </Drawer>
      ) : (
        <div className={'list-chat-windows_chat-bar'}>
          {loadActiveWindow}
          <div style={{ minWidth: '0.5em', margin: 0 }} />
        </div>
      )}

      {!isMobile && (
        <div className="list-bubbles-chat_chat-bar">{loadListBubleChat}</div>
      )}
    </>
  )
}

export default ChatBar
