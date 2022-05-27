import React, { useState, useEffect } from 'react'
import { CheckOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Col, Row, Statistic, Spin } from 'antd'
import Chart from 'chart.js'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import './index.scss'

const COUNT_POST_BY_MONTHS = gql`
  query countPostByMonths($months: [Int!]) {
    countPostByMonths(months: $months) {
      month
      count
    }
  }
`

const POST_REPORT = gql`
  query {
    reports {
      _id
      reporterID
      reportCount
      reporterName
      posterName
      postID
      posterID
      message
      tags
      createDate
    }
  }
`

function Index() {
	const currentMonth = new Date().getMonth() + 1

	const [dataArr, setDataArr] = useState([])

	let months = [3, 2, 1, 0].map((v) => {
		return currentMonth < v + 1 ? 12 + (currentMonth - v) : currentMonth - v
	})

	const {data, loading: loadingData} = useQuery(COUNT_POST_BY_MONTHS, {
		fetchPolicy: 'network-only',
		variables: {
			months
		}
	})

	const { data: reportedPosts } = useQuery(POST_REPORT, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	})

	useEffect(() => {
		if(!loadingData){
			setDataArr(data.countPostByMonths)
		}
	}, [loadingData])

	const drawChart = () => {
		var ctx = document.getElementById('myChart').getContext('2d')
		var myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: months.map(v => ` ${v}`),
				datasets: [
					{
						data: dataArr.filter(v => v.month !== 0).map(v => v.count),
						backgroundColor: [
							'rgba(54, 162, 235, 0.2)',
							'rgba(54, 162, 235, 0.2)',
							'rgba(54, 162, 235, 0.2)',
							'rgba(54, 162, 235, 0.2)',
						],
						borderColor: [
							'rgba(54, 162, 235, 1)',
							'rgba(54, 162, 235, 1)',
							'rgba(54, 162, 235, 1)',
							'rgba(54, 162, 235, 1)',
						],
						borderWidth: 2,
					},
				],
			},
			options: {
				scales: {
					yAxes: [
						{
							ticks: {
								beginAtZero: true,
								fontSize: 18,
							},
						},
					],
					xAxes: [
						{
							ticks: {
								fontSize: 18,
							},
						},
					],
				},
				legend: {
					display: false,
				},
				tooltips: {
					titleFontSize: 20,
					bodyFontSize: 20,
				},
			},
		})
		return myChart
	}

	useEffect(() => {
		drawChart()
	}, [dataArr])

	return (
		<>
			<Spin spinning={loadingData} style={{ maxHeight: '100vh' }}>
				<div className="content_dashboard">
					<div className="static_dashboard">
						<Col span={24}>
							<Row>
								<Col span={8}>
									<Statistic
										title="All Posts"
										value={dataArr.length > 0 ? dataArr[0].count : 'loading...'}
										prefix={<CheckOutlined />}
									/>
								</Col>
								<Col span={8}>
									<Statistic
										title="Reported Posts"
										value={(reportedPosts || []).length}
										prefix={<ClockCircleOutlined />}
									/>
								</Col>
							</Row>
						</Col>
					</div>
					<div className="bottom_dashboard">
						<Row>
							<Col xs={24} sm={24} md={24} lg={24} xl={24}>
								<div className="chart_dashboard">
									<canvas id="myChart" className="content_chart"></canvas>
									<h3>
										<i> Last 4 months uploaded photos</i>
									</h3>
								</div>
							</Col>
						</Row>
					</div>
				</div>
			</Spin>
		</>
	)
}

export default Index
