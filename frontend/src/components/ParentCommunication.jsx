        <List
          itemLayout="vertical"
          dataSource={announcements}
          renderItem={announcement => (
            <List.Item
              key={announcement.id}
              actions={isTeacher ? [
                <Button 
                  type="link" 
                  icon={<EditOutlined />} 
                  onClick={() => editAnnouncement(announcement.id)}
                >
                  编辑
                </Button>,
                <Popconfirm
                  title="确定要删除这条公告吗？"
                  onConfirm={() => deleteAnnouncement(announcement.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button 
                    type="link" 
                    icon={<DeleteOutlined />} 
                    danger
                  >
                    删除
                  </Button>
                </Popconfirm>
              ] : []}
              extra={
                <Space direction="vertical" align="end">
                  <Text type="secondary">
                    发布时间: {moment(announcement.publishTime).format('YYYY-MM-DD HH:mm')}
                  </Text>
                  <Space>
                    <Badge count={announcement.readCount} showZero />
                    <Text type="secondary">已读</Text>
                  </Space>
                </Space>
              }
            >
              <List.Item.Meta
                avatar={<Avatar icon={<BellOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                title={
                  <Space>
                    <Text strong>{announcement.title}</Text>
                    {announcement.priority === 'high' && (
                      <Tag color="red">重要</Tag>
                    )}
                    {announcement.priority === 'medium' && (
                      <Tag color="orange">一般</Tag>
                    )}
                    {announcement.priority === 'low' && (
                      <Tag color="blue">普通</Tag>
                    )}
                  </Space>
                }
                description={
                  <Space>
                    <Text type="secondary">发布人: {announcement.publisher.name}</Text>
                    <Text type="secondary">接收对象: {announcement.targetGroup}</Text>
                  </Space>
                }
              />
              <div className="announcement-content">
                <Paragraph>{announcement.content}</Paragraph>
                
                {announcement.attachments && announcement.attachments.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong>附件:</Text>
                    <div style={{ marginTop: 4 }}>
                      {announcement.attachments.map((attachment, index) => (
                        <Button 
                          key={index}
                          icon={<FileTextOutlined />} 
                          style={{ marginRight: 8, marginBottom: 8 }}
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          {attachment.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  };

  // 渲染活动标签页
  const renderEventsTab = () => {
    return (
      <div className="events-container">
        <Row gutter={16}>
          <Col span={16}>
            {isTeacher && (
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setEventModalVisible(true)}
                >
                  创建活动
                </Button>
              </div>
            )}
            
            <List
              itemLayout="vertical"
              dataSource={events}
              renderItem={event => (
                <List.Item
                  key={event.id}
                  actions={isTeacher ? [
                    <Button 
                      type="link" 
                      icon={<EditOutlined />} 
                      onClick={() => editEvent(event.id)}
                    >
                      编辑
                    </Button>,
                    <Popconfirm
                      title="确定要删除这个活动吗？"
                      onConfirm={() => deleteEvent(event.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button 
                        type="link" 
                        icon={<DeleteOutlined />} 
                        danger
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  ] : [
                    <Button 
                      type={event.isAttending ? "primary" : "default"}
                      onClick={() => toggleEventAttendance(event.id)}
                    >
                      {event.isAttending ? "已报名" : "报名参加"}
                    </Button>
                  ]}
                  extra={
                    <div style={{ textAlign: 'center', minWidth: 100 }}>
                      <div style={{ 
                        background: '#1890ff', 
                        color: '#fff', 
                        padding: '4px 0',
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4
                      }}>
                        {moment(event.startTime).format('MMM')}
                      </div>
                      <div style={{ 
                        fontSize: 24, 
                        fontWeight: 'bold',
                        padding: '8px 0',
                        border: '1px solid #1890ff',
                        borderTop: 'none',
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4
                      }}>
                        {moment(event.startTime).format('DD')}
                      </div>
                    </div>
                  }
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<CalendarOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={
                      <Space>
                        <Text strong>{event.title}</Text>
                        {moment(event.startTime).isAfter(moment()) && (
                          <Tag color="green">即将开始</Tag>
                        )}
                        {moment(event.startTime).isBefore(moment()) && moment(event.endTime).isAfter(moment()) && (
                          <Tag color="blue">进行中</Tag>
                        )}
                        {moment(event.endTime).isBefore(moment()) && (
                          <Tag color="default">已结束</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>
                          <ClockCircleOutlined /> 时间: {moment(event.startTime).format('YYYY-MM-DD HH:mm')} - {moment(event.endTime).format('HH:mm')}
                        </Text>
                        <Text>
                          <HomeOutlined /> 地点: {event.location}
                        </Text>
                        <Text>
                          <TeamOutlined /> 组织者: {event.organizer.name}
                        </Text>
                      </Space>
                    }
                  />
                  <div className="event-content">
                    <Paragraph>{event.description}</Paragraph>
                    
                    <div style={{ marginTop: 8 }}>
                      <Space>
                        <Text>已报名: {event.attendees.length} 人</Text>
                        <Button 
                          type="link" 
                          onClick={() => viewEventAttendees(event.id)}
                        >
                          查看名单
                        </Button>
                      </Space>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Col>
          
          <Col span={8}>
            <Card title="活动日历">
              <Calendar 
                fullscreen={false}
                value={selectedDate}
                onChange={setSelectedDate}
                dateCellRender={date => {
                  const eventsOnDate = events.filter(event => 
                    moment(event.startTime).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
                  );
                  
                  return eventsOnDate.length > 0 ? (
                    <Badge count={eventsOnDate.length} style={{ backgroundColor: '#1890ff' }} />
                  ) : null;
                }}
                onSelect={date => {
                  setSelectedDate(date);
                  // 可以添加筛选显示当天活动的逻辑
                }}
              />
              
              <Divider />
              
              <div>
                <Title level={5}>即将开始的活动</Title>
                <List
                  size="small"
                  dataSource={events.filter(event => moment(event.startTime).isAfter(moment()))}
                  renderItem={event => (
                    <List.Item>
                      <Text ellipsis>{event.title}</Text>
                      <Text type="secondary">{moment(event.startTime).format('MM-DD')}</Text>
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // 渲染报告标签页
  const renderReportsTab = () => {
    return (
      <div className="reports-container">
        {isTeacher && (
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setReportModalVisible(true)}
            >
              创建报告
            </Button>
          </div>
        )}
        
        <List
          itemLayout="vertical"
          dataSource={reports}
          renderItem={report => (
            <List.Item
              key={report.id}
              actions={isTeacher ? [
                <Button 
                  type="link" 
                  icon={<EditOutlined />} 
                  onClick={() => editReport(report.id)}
                >
                  编辑
                </Button>,
                <Popconfirm
                  title="确定要删除这份报告吗？"
                  onConfirm={() => deleteReport(report.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button 
                    type="link" 
                    icon={<DeleteOutlined />} 
                    danger
                  >
                    删除
                  </Button>
                </Popconfirm>
              ] : [
                <Button 
                  type="link" 
                  icon={<MessageOutlined />} 
                  onClick={() => respondToReport(report.id)}
                >
                  回复
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                title={
                  <Space>
                    <Text strong>{report.title}</Text>
                    <Tag color={
                      report.type === 'academic' ? 'blue' :
                      report.type === 'behavior' ? 'orange' :
                      report.type === 'attendance' ? 'green' :
                      'default'
                    }>
                      {
                        report.type === 'academic' ? '学业报告' :
                        report.type === 'behavior' ? '行为报告' :
                        report.type === 'attendance' ? '出勤报告' :
                        '其他报告'
                      }
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">
                      学生: {report.student.name}
                    </Text>
                    <Text type="secondary">
                      创建时间: {moment(report.createdAt).format('YYYY-MM-DD')}
                    </Text>
                    <Text type="secondary">
                      创建人: {report.creator.name}
                    </Text>
                  </Space>
                }
              />
              <div className="report-content">
                <Paragraph>{report.content}</Paragraph>
                
                {report.attachments && report.attachments.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong>附件:</Text>
                    <div style={{ marginTop: 4 }}>
                      {report.attachments.map((attachment, index) => (
                        <Button 
                          key={index}
                          icon={<FileTextOutlined />} 
                          style={{ marginRight: 8, marginBottom: 8 }}
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          {attachment.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {report.feedback && (
                  <div style={{ marginTop: 16, background: '#f9f9f9', padding: 16, borderRadius: 4 }}>
                    <Text strong>家长反馈:</Text>
                    <Paragraph style={{ marginTop: 8 }}>{report.feedback.content}</Paragraph>
                    <Text type="secondary">
                      反馈时间: {moment(report.feedback.time).format('YYYY-MM-DD HH:mm')}
                    </Text>
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  };

  // 渲染统计标签页
  const renderStatisticsTab = () => {
    return (
      <div className="statistics-container">
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="总消息数" 
                value={statistics.totalMessages} 
                prefix={<MessageOutlined />} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="未读消息" 
                value={statistics.unreadMessages} 
                prefix={<BellOutlined />} 
                valueStyle={{ color: statistics.unreadMessages > 0 ? '#ff4d4f' : 'inherit' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="公告数量" 
                value={statistics.totalAnnouncements} 
                prefix={<FileTextOutlined />} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="即将开始的活动" 
                value={statistics.upcomingEvents} 
                prefix={<CalendarOutlined />} 
              />
            </Card>
          </Col>
        </Row>
        
        <Card title="家长参与度" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Progress 
                type="circle" 
                percent={statistics.parentEngagement} 
                format={percent => `${percent}%`}
                width={120}
              />
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Text>家长参与度</Text>
              </div>
            </Col>
            <Col span={12}>
              <Timeline>
                <Timeline.Item>创建家校沟通群组</Timeline.Item>
                <Timeline.Item>发布第一条公告</Timeline.Item>
                <Timeline.Item>创建第一个活动</Timeline.Item>
                <Timeline.Item>发送第一份学生报告</Timeline.Item>
                <Timeline.Item>收到家长反馈</Timeline.Item>
              </Timeline>
            </Col>
          </Row>
        </Card>
        
        {isTeacher && (
          <Card title="家长活跃度排行" style={{ marginTop: 16 }}>
            <Table
              dataSource={parents.map(parent => ({
                ...parent,
                key: parent.id,
                messageCount: conversations.find(c => 
                  c.participants.some(p => p.id === parent.id)
                )?.messages?.length || 0,
                lastActive: conversations.find(c => 
                  c.participants.some(p => p.id === parent.id)
                )?.lastMessage?.time || parent.lastLoginTime
              }))}
              columns={[
                {
                  title: '家长姓名',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => (
                    <Space>
                      <Avatar src={record.avatar} icon={<UserOutlined />} />
                      <Text>{text}</Text>
                    </Space>
                  )
                },
                {
                  title: '学生姓名',
                  dataIndex: 'studentName',
                  key: 'studentName'
                },
                {
                  title: '消息数量',
                  dataIndex: 'messageCount',
                  key: 'messageCount',
                  sorter: (a, b) => a.messageCount - b.messageCount
                },
                {
                  title: '最近活跃',
                  dataIndex: 'lastActive',
                  key: 'lastActive',
                  render: text => text ? moment(text).format('YYYY-MM-DD HH:mm') : '-',
                  sorter: (a, b) => moment(a.lastActive) - moment(b.lastActive)
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => (
                    <Button 
                      type="link" 
                      onClick={() => {
                        const conversation = conversations.find(c => 
                          c.participants.some(p => p.id === record.id)
                        );
                        if (conversation) {
                          setActiveTab('messages');
                          selectConversation(conversation.id);
                        }
                      }}
                    >
                      发送消息
                    </Button>
                  )
                }
              ]}
            />
          </Card>
        )}
      </div>
    );
  };

  return (
    <Card
      title={
        <Space>
          <TeamOutlined />
          <span>家校沟通平台</span>
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => setSettingsVisible(true)}
          >
            设置
          </Button>
        </Space>
      }
      style={{ height: '100%' }}
      bodyStyle={{ height: 'calc(100% - 57px)', padding: 0 }}
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabBarStyle={{ padding: '0 24px' }}
      >
        <TabPane 
          tab={
            <span>
              <MessageOutlined />
              消息
              {statistics.unreadMessages > 0 && (
                <Badge count={statistics.unreadMessages} style={{ marginLeft: 8 }} />
              )}
            </span>
          } 
          key="messages"
        >
          <div style={{ height: 'calc(100vh - 170px)', display: 'flex' }}>
            {renderConversations()}
            {renderMessages()}
          </div>
        </TabPane>
        <TabPane 
          tab={
            <span>
              <BellOutlined />
              公告
            </span>
          } 
          key="announcements"
        >
          {renderAnnouncementsTab()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <CalendarOutlined />
              活动
            </span>
          } 
          key="events"
        >
          {renderEventsTab()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              学生报告
            </span>
          } 
          key="reports"
        >
          {renderReportsTab()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              统计
            </span>
          } 
          key="statistics"
        >
          {renderStatisticsTab()}
        </TabPane>
      </Tabs>
      
      {/* 公告模态框 */}
      <Modal
        title="发布公告"
        open={announcementModalVisible}
        onOk={handleAnnouncementSubmit}
        onCancel={() => setAnnouncementModalVisible(false)}
        width={700}
      >
        {/* 公告表单 */}
      </Modal>
      
      {/* 活动模态框 */}
      <Modal
        title="创建活动"
        open={eventModalVisible}
        onOk={handleEventSubmit}
        onCancel={() => setEventModalVisible(false)}
        width={700}
      >
        {/* 活动表单 */}
      </Modal>
      
      {/* 报告模态框 */}
      <Modal
        title="创建学生报告"
        open={reportModalVisible}
        onOk={handleReportSubmit}
        onCancel={() => setReportModalVisible(false)}
        width={700}
      >
        {/* 报告表单 */}
      </Modal>
      
      {/* 模板模态框 */}
      <Modal
        title="选择消息模板"
        open={templateModalVisible}
        onCancel={() => setTemplateModalVisible(false)}
        footer={null}
      >
        {/* 模板列表 */}
      </Modal>
      
      {/* 设置抽屉 */}
      <Drawer
        title="通信设置"
        placement="right"
        width={400}
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
      >
        {/* 设置表单 */}
      </Drawer>
      
      {/* 图片预览 */}
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Card>
  );
};

export default ParentCommunication; 