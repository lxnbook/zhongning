                      }
                      description={
                        <Space size={8}>
                          {participant.isOnline && <Badge status="success" text="在线" />}
                          {!participant.isOnline && <Badge status="default" text="离线" />}
                          {participant.isVideoOn && <VideoCameraOutlined />}
                          {participant.isAudioOn && <AudioOutlined />}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
            
            {/* 问题列表 */}
            <Card 
              title={
                <Space>
                  <QuestionCircleOutlined />
                  <span>问题 ({questions.length})</span>
                </Space>
              }
              extra={
                <Button 
                  size="small" 
                  type="primary" 
                  onClick={() => setQuestionModalVisible(true)}
                  disabled={classStatus !== 'active'}
                >
                  提问
                </Button>
              }
              bodyStyle={{ height: 150, overflowY: 'auto' }}
            >
              {questions.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={questions}
                  renderItem={question => (
                    <List.Item
                      actions={isTeacher ? [
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => answerQuestion(question.id)}
                        >
                          回答
                        </Button>
                      ] : []}
                    >
                      <List.Item.Meta
                        avatar={<Avatar src={question.asker.avatar} icon={<UserOutlined />} />}
                        title={
                          <Space>
                            <Text>{question.asker.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {moment(question.time).format('HH:mm:ss')}
                            </Text>
                            {question.answered && <Tag color="green">已回答</Tag>}
                          </Space>
                        }
                        description={question.content}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无问题" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Col>
        </Row>
        
        {/* 底部控制栏 */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            {isTeacher && classStatus === 'waiting' && (
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                onClick={startClass}
              >
                开始课程
              </Button>
            )}
            {isTeacher && classStatus === 'active' && (
              <Button 
                danger 
                icon={<PauseCircleOutlined />} 
                onClick={endClass}
              >
                结束课程
              </Button>
            )}
            {isTeacher && (
              <>
                <Button 
                  icon={<FileTextOutlined />} 
                  onClick={() => setResourceDrawerVisible(true)}
                >
                  课程资源
                </Button>
                <Button 
                  icon={<BarChartOutlined />} 
                  onClick={() => setPollModalVisible(true)}
                >
                  发起投票
                </Button>
              </>
            )}
          </Space>
          
          <Space>
            <Button 
              icon={<RobotOutlined />} 
              onClick={() => setAiAssistantVisible(true)}
            >
              AI助手
            </Button>
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => setSettingsVisible(true)}
            >
              设置
            </Button>
          </Space>
        </div>
      </div>
    );
  };

  // 渲染资源标签页
  const renderResourcesTab = () => {
    return (
      <div className="classroom-resources">
        <List
          itemLayout="horizontal"
          dataSource={resources}
          renderItem={resource => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  onClick={() => shareResource(resource.id)}
                >
                  分享
                </Button>,
                <Button 
                  type="link" 
                  onClick={() => downloadResource(resource.id)}
                >
                  下载
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar icon={
                    resource.type === 'document' ? <FileTextOutlined /> :
                    resource.type === 'image' ? <PictureOutlined /> :
                    resource.type === 'video' ? <VideoCameraOutlined /> :
                    resource.type === 'presentation' ? <DesktopOutlined /> :
                    <FileTextOutlined />
                  } />
                }
                title={resource.title}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">
                      类型: {
                        resource.type === 'document' ? '文档' :
                        resource.type === 'image' ? '图片' :
                        resource.type === 'video' ? '视频' :
                        resource.type === 'presentation' ? '演示文稿' :
                        '其他'
                      }
                    </Text>
                    <Text type="secondary">
                      大小: {formatFileSize(resource.size)}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  // 渲染投票标签页
  const renderPollsTab = () => {
    return (
      <div className="classroom-polls">
        {polls.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={polls}
            renderItem={poll => (
              <List.Item>
                <Card title={poll.question}>
                  {poll.options.map((option, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <Space>
                        {!poll.voted && (
                          <Button 
                            size="small" 
                            onClick={() => votePoll(poll.id, index)}
                          >
                            投票
                          </Button>
                        )}
                        <Text>{option.text}</Text>
                      </Space>
                      <Progress 
                        percent={Math.round((option.votes / poll.totalVotes) * 100) || 0} 
                        size="small" 
                        format={percent => `${percent}% (${option.votes}票)`}
                      />
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      总投票数: {poll.totalVotes} | 
                      状态: {poll.active ? '进行中' : '已结束'} | 
                      发起时间: {moment(poll.time).format('HH:mm:ss')}
                    </Text>
                    {isTeacher && poll.active && (
                      <Button 
                        size="small" 
                        type="link" 
                        onClick={() => endPoll(poll.id)}
                      >
                        结束投票
                      </Button>
                    )}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无投票" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            {isTeacher && (
              <Button 
                type="primary" 
                onClick={() => setPollModalVisible(true)}
              >
                发起投票
              </Button>
            )}
          </Empty>
        )}
      </div>
    );
  };

  return (
    <Card
      title={
        <Space>
          <VideoCameraOutlined />
          <span>
            {classInfo ? classInfo.title : '互动课堂'}
          </span>
          {classInfo && (
            <Tag color="blue">{classInfo.subject}</Tag>
          )}
        </Space>
      }
      loading={loading}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <DesktopOutlined />
              主屏幕
            </span>
          } 
          key="main"
        >
          {renderMainScreen()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              资源
            </span>
          } 
          key="resources"
        >
          {renderResourcesTab()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              投票
              {polls.filter(p => p.active).length > 0 && (
                <Badge 
                  count={polls.filter(p => p.active).length} 
                  size="small" 
                  style={{ marginLeft: 4 }} 
                />
              )}
            </span>
          } 
          key="polls"
        >
          {renderPollsTab()}
        </TabPane>
      </Tabs>
      
      {/* 问题模态框 */}
      <Modal
        title="提问"
        open={questionModalVisible}
        onOk={submitQuestion}
        onCancel={() => setQuestionModalVisible(false)}
      >
        <Form form={questionForm} layout="vertical">
          <Form.Item
            name="question"
            label="问题内容"
            rules={[{ required: true, message: '请输入问题内容' }]}
          >
            <TextArea rows={4} placeholder="请输入您的问题" />
          </Form.Item>
          <Form.Item
            name="anonymous"
            valuePropName="checked"
          >
            <Switch checkedChildren="匿名提问" unCheckedChildren="实名提问" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 投票模态框 */}
      <Modal
        title="发起投票"
        open={pollModalVisible}
        onOk={submitPoll}
        onCancel={() => setPollModalVisible(false)}
        width={600}
      >
        <Form form={pollForm} layout="vertical">
          <Form.Item
            name="question"
            label="投票问题"
            rules={[{ required: true, message: '请输入投票问题' }]}
          >
            <Input placeholder="请输入投票问题" />
          </Form.Item>
          
          <Form.List name="options">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    key={field.key}
                    label={index === 0 ? '选项' : ''}
                    required={false}
                    style={{ marginBottom: 8 }}
                  >
                    <Space>
                      <Form.Item
                        {...field}
                        name={[field.name, 'text']}
                        fieldKey={[field.fieldKey, 'text']}
                        rules={[{ required: true, message: '请输入选项内容' }]}
                        noStyle
                      >
                        <Input placeholder={`选项 ${index + 1}`} style={{ width: 400 }} />
                      </Form.Item>
                      {fields.length > 2 && (
                        <Button
                          type="text"
                          danger
                          icon={<CloseCircleOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      )}
                    </Space>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add({ text: '' })}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加选项
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="anonymous"
                valuePropName="checked"
                label="匿名投票"
              >
                <Switch checkedChildren="匿名" unCheckedChildren="实名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="multipleChoice"
                valuePropName="checked"
                label="多选投票"
              >
                <Switch checkedChildren="多选" unCheckedChildren="单选" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="duration"
            label="投票时长(秒)"
            initialValue={60}
          >
            <Input type="number" min={10} max={300} />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 设置模态框 */}
      <Modal
        title="课堂设置"
        open={settingsVisible}
        onOk={() => {
          settingsForm.validateFields().then(values => {
            // 应用设置
            setSettingsVisible(false);
          });
        }}
        onCancel={() => setSettingsVisible(false)}
      >
        <Form form={settingsForm} layout="vertical">
          <Form.Item
            name="allowChat"
            valuePropName="checked"
            label="允许聊天"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          
          <Form.Item
            name="allowQuestions"
            valuePropName="checked"
            label="允许提问"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          
          <Form.Item
            name="allowScreenShare"
            valuePropName="checked"
            label="允许屏幕共享"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          
          <Form.Item
            name="recordClass"
            valuePropName="checked"
            label="录制课程"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          
          <Form.Item
            name="autoTranscribe"
            valuePropName="checked"
            label="自动转录"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 资源抽屉 */}
      <Drawer
        title="课程资源"
        placement="right"
        width={500}
        onClose={() => setResourceDrawerVisible(false)}
        open={resourceDrawerVisible}
        extra={
          isTeacher && (
            <Upload>
              <Button icon={<UploadOutlined />}>上传资源</Button>
            </Upload>
          )
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={resources}
          renderItem={resource => (
            <List.Item
              actions={[
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={() => shareResource(resource.id)}
                >
                  分享
                </Button>,
                <Button 
                  size="small" 
                  onClick={() => previewResource(resource.id)}
                >
                  预览
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar icon={
                    resource.type === 'document' ? <FileTextOutlined /> :
                    resource.type === 'image' ? <PictureOutlined /> :
                    resource.type === 'video' ? <VideoCameraOutlined /> :
                    resource.type === 'presentation' ? <DesktopOutlined /> :
                    <FileTextOutlined />
                  } />
                }
                title={resource.title}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">
                      类型: {
                        resource.type === 'document' ? '文档' :
                        resource.type === 'image' ? '图片' :
                        resource.type === 'video' ? '视频' :
                        resource.type === 'presentation' ? '演示文稿' :
                        '其他'
                      }
                    </Text>
                    <Text type="secondary">
                      大小: {formatFileSize(resource.size)}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
      
      {/* 考勤抽屉 */}
      <Drawer
        title="课堂考勤"
        placement="right"
        width={500}
        onClose={() => setAttendanceVisible(false)}
        open={attendanceVisible}
      >
        <Statistic 
          title="出勤率" 
          value={Math.round((participants.filter(p => p.isOnline).length / participants.length) * 100)} 
          suffix="%" 
          style={{ marginBottom: 24 }}
        />
        
        <List
          itemLayout="horizontal"
          dataSource={participants}
          renderItem={participant => (
            <List.Item
              actions={[
                <Tag color={participant.isOnline ? 'green' : 'red'}>
                  {participant.isOnline ? '在线' : '离线'}
                </Tag>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={participant.avatar} icon={<UserOutlined />} />}
                title={participant.name}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">
                      加入时间: {moment(participant.joinTime).format('HH:mm:ss')}
                    </Text>
                    {participant.leaveTime && (
                      <Text type="secondary">
                        离开时间: {moment(participant.leaveTime).format('HH:mm:ss')}
                      </Text>
                    )}
                    <Text type="secondary">
                      在线时长: {formatTime(participant.onlineTime)}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
      
      {/* AI助手抽屉 */}
      <Drawer
        title={
          <Space>
            <RobotOutlined />
            <span>AI教学助手</span>
          </Space>
        }
        placement="right"
        width={400}
        onClose={() => setAiAssistantVisible(false)}
        open={aiAssistantVisible}
      >
        <div style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
            {aiAssistantMessages.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={aiAssistantMessages}
                renderItem={message => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        message.role === 'user' ? (
                          <Avatar icon={<UserOutlined />} />
                        ) : (
                          <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
                        )
                      }
                      content={message.content}
                      description={
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <RobotOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                <Title level={4}>AI教学助手</Title>
                <Paragraph type="secondary">
                  我可以帮助您解答课堂问题、提供教学建议、解释概念等。
                </Paragraph>
              </div>
            )}
          </div>
          
          <div>
            <Input.Group compact style={{ display: 'flex' }}>
              <Input
                style={{ flex: 1 }}
                value={aiAssistantInput}
                onChange={e => setAiAssistantInput(e.target.value)}
                onPressEnter={sendAiAssistantMessage}
                placeholder="向AI助手提问..."
                disabled={aiAssistantLoading}
              />
              <Button 
                type="primary" 
                icon={<SendOutlined />} 
                onClick={sendAiAssistantMessage}
                loading={aiAssistantLoading}
              >
                发送
              </Button>
            </Input.Group>
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                AI助手可以根据课堂内容提供相关帮助
              </Text>
            </div>
          </div>
        </div>
      </Drawer>
    </Card>
  );
};

export default InteractiveClassroom; 