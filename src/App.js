import './App.css';
import React from 'react';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
function App() {
	const [text, setText] = React.useState('');
	const [dispaly, setDisplay] = React.useState('');
	const custom_config = {
		extraPlugins: [MyCustomUploadAdapterPlugin],
		// plugin: [Font],

		toolbar: {
			toolbar: {
				items: [
					'heading',
					'|',
					'alignment',
					'|',
					'bold',
					'italic',
					'strikethrough',
					'underline',
					'subscript',
					'superscript',
					'|',
					'link',
					'|',
					'bulletedList',
					'numberedList',
					'todoList',
					'-', // break point
					'fontfamily',
					'fontsize',
					'fontColor',
					'fontBackgroundColor',
					'|',
					'code',
					'codeBlock',
					'|',
					'insertTable',
					'|',
					'outdent',
					'indent',
					'|',
					'uploadImage',
					'blockQuote',
					'|',
					'undo',
					'redo',
					'heading',
					'|',
					'bulletedList',
					'numberedList',
					'fontfamily',
					'fontsize',
					'|',
					'alignment',
					'|',
					'fontColor',
					'fontBackgroundColor',
					'|',
					'bold',
					'italic',
					'strikethrough',
					'underline',
					'subscript',
					'superscript',
					'|',
					'link',
					'|',
					'outdent',
					'indent',
					'|',
					'todoList',
					'|',
					'code',
					'codeBlock',
					'|',
					'insertTable',
					'|',
					'uploadImage',
					'blockQuote',
					'|',
					'undo',
					'redo',
				],
			},
			fontSize: {
				options: [9, 11, 13, 'default', 17, 19, 21],
			},
			shouldNotGroupWhenFull: true,
		},

		table: {
			contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
		},
	};
	const handleChange = (event, editor) => {
		// event.preventDefault();
		const data = editor.getData();
		setText(data);
	};

	const handleSub = () => setDisplay(text);
	return (
		<div className="container mt-5">
			<h6 style={{}}>This is the input value: {dispaly} </h6>
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					marginTop: 50,
				}}
				className="container"
			>
				<div className="" style={{ marginTop: 30 }}>
					<CKEditor
						required
						editor={ClassicEditor}
						config={custom_config}
						// data={value}
						onChange={handleChange}
						onPaste={(e) => {
							e.preventDefault();
							return false;
						}}
						onReady={(editor) => {
							const documentView = editor.editing.view.document;
							documentView.on('paste', (event, data) => {
								event.stop();
								event.cancel(); // Uncaught CKEditorError: event.cancel is not a function
								event.preventDefault(); // Uncaught CKEditorError: event.preventDefault is not a function
								return false;
							});
						}}
					/>
					<div className="">
						<button
							variant="contained"
							color="secondary"
							onClick={handleSub}
							style={{
								padding: '10px 20px',
								marginTop: 20,
								border: 'none',
								backgroundColor: '#300dd9',
								borderRadius: 8,
								color: '#FFFFFF',
								fontSize: 20,

								fontWeight: 600,
								cursor: 'pointer',
							}}
						>
							Click me
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function MyCustomUploadAdapterPlugin(editor) {
	editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
		return new MyUploadAdapter(loader);
	};
}

class MyUploadAdapter {
	constructor(props) {
		this.loader = props;
		// this.url = `https://api.bitpointx.com.au/api/v1/statements/image-upload`;
		this.url = `http://192.168.0.23:5000/post`;
		// ``;
	}

	//TODO Starts the upload process.
	upload() {
		return new Promise((resolve, reject) => {
			this._initRequest();
			this._initListeners(resolve, reject);
			this._sendRequest();
		});
	}

	abort() {
		if (this.xhr) {
			this.xhr.abort();
		}
	}

	_initRequest() {
		const xhr = (this.xhr = new XMLHttpRequest());

		xhr.open('POST', this.url, true);
		xhr.responseType = 'json';
		// xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
		// xhr.setRequestHeader('Authorization', `Bearer ${token}`);
	}

	_initListeners(resolve, reject) {
		const xhr = this.xhr;
		const loader = this.loader;
		const genericErrorText = `Couldn't upload file: ${loader.file.name}.`;

		xhr.addEventListener('error', () => reject(genericErrorText));
		xhr.addEventListener('abort', () => reject());
		xhr.addEventListener('load', () => {
			const response = xhr.response;
			if (!response || response.error) {
				return reject(
					response && response.error ? response.error.message : genericErrorText
				);
			}
			resolve({
				default: response.s3Url,
			});
		});

		if (xhr.upload) {
			xhr.upload.addEventListener('progress', (evt) => {
				if (evt.lengthComputable) {
					loader.uploadTotal = evt.total;
					loader.uploaded = evt.loaded;
				}
			});
		}
	}
	_sendRequest() {
		const data = new FormData();
		console.log('this is the data', data);

		this.loader.file.then((result) => {
			data.append('image', result);
			this.xhr.send(data);
		});
	}
}

export default App;
